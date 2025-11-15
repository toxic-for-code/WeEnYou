import Razorpay from "razorpay";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import BookingPayment from '@/models/BookingPayment';

export const dynamic = 'force-dynamic';

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
    
    // Handle payment success across multiple Razorpay events
    if (event.event === "payment.captured" || event.event === "payment.authorized" || event.event === "order.paid") {
      console.log(`Processing ${event.event} event`);

      // Extract order, payment info and notes across different event payloads
      let orderId: string | undefined;
      let notes: any = {};
      let amountPaise: number | undefined;
      let paymentId: string | undefined;
      if (event.event === "order.paid") {
        const order = event.payload.order.entity;
        orderId = order.id;
        notes = order.notes || {};
        amountPaise = typeof order.amount === 'number' ? order.amount : undefined;
      } else {
        const payment = event.payload.payment.entity;
        orderId = payment.order_id;
        notes = payment.notes || {};
        amountPaise = typeof payment.amount === 'number' ? payment.amount : undefined;
        paymentId = payment.id;
      }

      console.log('Looking up booking for orderId:', orderId);

      // Try to find booking by orderId
      let booking = orderId ? await getBookingByOrderId(orderId) : null;
      if (!booking && notes && notes.bookingId) {
        // Fallback: find by bookingId from notes
        console.log('Booking not found by orderId, trying bookingId from notes:', notes.bookingId);
        booking = await Booking.findById(notes.bookingId);
        if (booking) {
          console.log('Booking found by bookingId from notes:', booking._id);
        }
      }

      if (!booking) {
        console.error("Booking not found for orderId or bookingId:", orderId, notes?.bookingId);
        return NextResponse.json({ error: "Booking not found" }, { status: 404 });
      }

      console.log('Booking found:', booking._id, 'Current status:', booking.status, 'Current paymentStatus:', booking.paymentStatus, 'Current advancePaid:', booking.advancePaid);

      // Determine payment type (advance/final) from order notes if available
      let paymentType = 'advance';
      if (notes && notes.type) {
        paymentType = notes.type;
      }

      console.log('Payment type determined:', paymentType, 'Notes:', notes);

      // Update booking based on payment type
      try {
        if (paymentType === 'advance') {
          const updateResult = await Booking.findByIdAndUpdate(booking._id, {
            $set: {
              advancePaid: true,
              status: 'pending_owner_confirmation',
              paymentStatus: 'pending',
            }
          }, { new: true });
          console.log('Advance payment update result:', updateResult);

          // Upsert BookingPayment record with advance paid amount
          try {
            const paidAmount = typeof amountPaise === 'number' ? Math.round(amountPaise / 100) : undefined;
            const totalAmount = typeof booking.totalPrice === 'number' ? booking.totalPrice : undefined;
            if (typeof paidAmount === 'number' && typeof totalAmount === 'number') {
              const remainingAmount = Math.max(0, totalAmount - paidAmount);
              // Persist numeric amounts on Booking document as well
              await Booking.findByIdAndUpdate(booking._id, {
                $set: {
                  advanceAmountPaid: paidAmount,
                  remainingAmount,
                }
              });
              await BookingPayment.findOneAndUpdate(
                { userId: booking.userId, hallId: booking.hallId },
                {
                  $set: {
                    userId: booking.userId,
                    hallId: booking.hallId,
                    totalAmount: totalAmount,
                    advanceAmountRequested: paidAmount,
                    advanceAmountPaid: paidAmount,
                    advanceOrderId: orderId,
                    advancePaymentId: paymentId,
                    advancePaymentStatus: 'paid',
                    remainingAmount,
                    status: 'request_sent',
                  }
                },
                { upsert: true, new: true }
              );
              console.log('BookingPayment upserted for advance payment:', { bookingId: booking._id.toString(), paidAmount, remainingAmount });
            } else {
              console.warn('Skipping BookingPayment upsert: missing paidAmount or totalAmount', { amountPaise, totalAmount });
            }
          } catch (bpErr) {
            console.error('Failed to upsert BookingPayment after advance payment', bpErr);
          }
        } else if (paymentType === 'final') {
          const updateResult = await Booking.findByIdAndUpdate(booking._id, {
            $set: {
              finalPaymentStatus: 'paid',
              paymentStatus: 'paid',
              remainingAmount: 0,
            }
          }, { new: true });
          console.log('Final payment update result:', updateResult);
        } else {
          const updateResult = await Booking.findByIdAndUpdate(booking._id, {
            $set: {
              advancePaid: true,
              status: 'pending_owner_confirmation',
              paymentStatus: 'pending',
            }
          }, { new: true });
          console.log('Fallback advance payment update result:', updateResult);

          // Also upsert BookingPayment on fallback as advance
          try {
            const paidAmount = typeof amountPaise === 'number' ? Math.round(amountPaise / 100) : undefined;
            const totalAmount = typeof booking.totalPrice === 'number' ? booking.totalPrice : undefined;
            if (typeof paidAmount === 'number' && typeof totalAmount === 'number') {
              const remainingAmount = Math.max(0, totalAmount - paidAmount);
              // Persist numeric amounts on Booking document as well
              await Booking.findByIdAndUpdate(booking._id, {
                $set: {
                  advanceAmountPaid: paidAmount,
                  remainingAmount,
                }
              });
              await BookingPayment.findOneAndUpdate(
                { userId: booking.userId, hallId: booking.hallId },
                {
                  $set: {
                    userId: booking.userId,
                    hallId: booking.hallId,
                    totalAmount: totalAmount,
                    advanceAmountRequested: paidAmount,
                    advanceAmountPaid: paidAmount,
                    advanceOrderId: orderId,
                    advancePaymentId: paymentId,
                    advancePaymentStatus: 'paid',
                    remainingAmount,
                    status: 'request_sent',
                  }
                },
                { upsert: true, new: true }
              );
              console.log('BookingPayment upserted (fallback) for advance payment:', { bookingId: booking._id.toString(), paidAmount, remainingAmount });
            }
          } catch (bpErr) {
            console.error('Failed to upsert BookingPayment on fallback', bpErr);
          }
        }
      } catch (updateError) {
        console.error('Error updating booking after payment success:', updateError);
        return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
      }

      // Only trigger owner payout on captured/settled events (avoid on mere authorization)
      const shouldTriggerPayout = event.event === 'payment.captured' || event.event === 'order.paid';
      if (!shouldTriggerPayout) {
        return NextResponse.json({ status: `Booking updated on ${event.event}` });
      }

      // 1. Create Contact (if not already created)
      let contactId = booking.ownerContactId;
      if (!contactId) {
        const contact = await (razorpay as any).contacts.create({
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
          fundAccount = await (razorpay as any).fundAccount.create({
            contact_id: contactId,
            account_type: "vpa",
            vpa: { address: booking.ownerBankDetails.upi },
          });
        } else {
          fundAccount = await (razorpay as any).fundAccount.create({
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
      const payout = await (razorpay as any).payouts.create({
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