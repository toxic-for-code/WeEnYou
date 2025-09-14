import Razorpay from "razorpay";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';

// Utility functions using existing database connection
async function getBookingByOrderId(orderId) {
  await connectDB();
  return await Booking.findOne({ orderId });
}
async function saveContactIdToOwner(ownerId, contactId) {
  await Booking.updateMany({ ownerId }, { $set: { ownerContactId: contactId } });
}
async function saveFundAccountIdToOwner(ownerId, fundAccountId) {
  await Booking.updateMany({ ownerId }, { $set: { ownerFundAccountId: fundAccountId } });
}
async function savePayoutToBooking(bookingId, payoutId, payoutStatus) {
  await Booking.findByIdAndUpdate(bookingId, { $set: { payoutId, payoutStatus } });
}
async function markBookingPaid(bookingId) {
  await Booking.findByIdAndUpdate(bookingId, { $set: { paymentStatus: 'paid' } });
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(req) {
  try {
    const signature = req.headers.get("x-razorpay-signature");
    const body = await req.text();
    
    console.log('Webhook received - Headers:', Object.fromEntries(req.headers.entries()));
    console.log('Webhook body length:', body.length);
    
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");
      
    if (signature !== expectedSignature) {
      console.error('Webhook signature mismatch:', { received: signature, expected: expectedSignature });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Webhook event:', event.event, 'Payload keys:', Object.keys(event.payload || {}));
    
    if (event.event === "payment.captured") {
      console.log('Processing payment.captured event');
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      console.log('Looking up booking for orderId:', orderId);
      
      // Try to find booking by orderId
      let booking = await getBookingByOrderId(orderId);
      if (!booking && payment.notes && payment.notes.bookingId) {
        // Fallback: find by bookingId from notes
        console.log('Booking not found by orderId, trying bookingId from notes:', payment.notes.bookingId);
        booking = await Booking.findById(payment.notes.bookingId);
        if (booking) {
          console.log('Booking found by bookingId from notes:', booking._id);
        }
      }
      
      if (!booking) {
        console.error("Booking not found for orderId or bookingId:", orderId, payment.notes?.bookingId);
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      console.log('Booking found:', booking._id, 'Current status:', booking.status, 'Current paymentStatus:', booking.paymentStatus, 'Current advancePaid:', booking.advancePaid);
      
      // Determine payment type (advance/final) from order notes if available
      let paymentType = 'advance';
      if (payment.notes && payment.notes.type) {
        paymentType = payment.notes.type;
      }
      
      console.log('Payment type determined:', paymentType, 'Payment notes:', payment.notes);

      if (paymentType === 'advance') {
        // Mark advance as paid and set status to pending_owner_confirmation
        console.log('Processing advance payment for booking:', booking._id);
        try {
          const updateResult = await Booking.findByIdAndUpdate(booking._id, {
            $set: {
              advancePaid: true,
              status: 'pending_owner_confirmation',
              paymentStatus: 'pending', // Not fully paid yet - advance payment is separate from final payment
            }
          }, { new: true });
          console.log('Advance payment update result:', updateResult);
          
          // Verify the update was successful
          const updatedBooking = await Booking.findById(booking._id);
          console.log('Verification - Updated booking status:', updatedBooking?.status, 'advancePaid:', updatedBooking?.advancePaid, 'paymentStatus:', updatedBooking?.paymentStatus);
        } catch (updateError) {
          console.error('Error updating booking for advance payment:', updateError);
          return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
        }
      } else if (paymentType === 'final') {
        // Mark final payment as paid
        console.log('Processing final payment for booking:', booking._id);
        try {
          const updateResult = await Booking.findByIdAndUpdate(booking._id, {
            $set: {
              finalPaymentStatus: 'paid',
              paymentStatus: 'paid', // Now fully paid
            }
          }, { new: true });
          console.log('Final payment update result:', updateResult);
        } catch (updateError) {
          console.error('Error updating booking for final payment:', updateError);
          return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
        }
      } else {
        // Fallback: treat as advance payment if type is not specified
        console.log('Payment type not specified, treating as advance payment');
        try {
          const updateResult = await Booking.findByIdAndUpdate(booking._id, {
            $set: {
              advancePaid: true,
              status: 'pending_owner_confirmation',
              paymentStatus: 'pending',
            }
          }, { new: true });
          console.log('Fallback advance payment update result:', updateResult);
        } catch (updateError) {
          console.error('Error updating booking for fallback advance payment:', updateError);
          return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
        }
      }

      // 1. Create Contact (if not already created)
    let contactId = booking.ownerContactId;
    if (!contactId) {
      const contact = await razorpay.contacts.create({
        name: booking.ownerName,
        email: booking.ownerEmail,
        contact: booking.ownerPhone,
        type: "vendor",
      });
      contactId = contact.id;
      await saveContactIdToOwner(booking.ownerId, contactId);
    }

    // 2. Create Fund Account (if not already created)
    let fundAccountId = booking.ownerFundAccountId;
    if (!fundAccountId) {
      let fundAccount;
      if (booking.ownerBankDetails.upi) {
        fundAccount = await razorpay.fundAccount.create({
          contact_id: contactId,
          account_type: "vpa",
          vpa: { address: booking.ownerBankDetails.upi },
        });
      } else {
        fundAccount = await razorpay.fundAccount.create({
          contact_id: contactId,
          account_type: "bank_account",
          bank_account: {
            name: booking.ownerBankDetails.name,
            ifsc: booking.ownerBankDetails.ifsc,
            account_number: booking.ownerBankDetails.accountNumber,
          },
        });
      }
      fundAccountId = fundAccount.id;
      await saveFundAccountIdToOwner(booking.ownerId, fundAccountId);
    }

    // 3. Trigger payout
    const payout = await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_PAYOUT_ACCOUNT_NUMBER, // Your virtual account number
      fund_account_id: fundAccountId,
      amount: booking.venuePrice * 100, // paise
      currency: "INR",
      mode: booking.ownerBankDetails.upi ? "upi" : "imps",
      purpose: "vendor_payment",
      queue_if_low_balance: true,
      narration: "Venue Booking Payout",
      notes: { bookingId: booking._id.toString() },
    });
    await savePayoutToBooking(booking._id, payout.id, payout.status);
    return NextResponse.json({ status: "Payout triggered and paymentStatus set to paid" });
  }

  // Handle payout status webhooks
  if (event.event === "payout.processed") {
    const payout = event.payload.payout.entity;
    await Booking.findOneAndUpdate({ payoutId: payout.id }, { $set: { payoutStatus: 'processed' } });
    // Optionally notify admin/owner here
    return NextResponse.json({ status: "Payout processed" });
  }
  if (event.event === "payout.failed") {
    const payout = event.payload.payout.entity;
    await Booking.findOneAndUpdate({ payoutId: payout.id }, { $set: { payoutStatus: 'failed' } });
    // Optionally notify admin/owner here
    return NextResponse.json({ status: "Payout failed" });
  }

  return NextResponse.json({ status: "Ignored" });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}