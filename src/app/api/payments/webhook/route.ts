import Razorpay from "razorpay";
import crypto from "crypto";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Booking from '@/models/Booking';

// Utility functions using Mongoose/Booking model
async function getBookingByOrderId(orderId) {
  await mongoose.connect(process.env.MONGODB_URI);
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
  const signature = req.headers.get("x-razorpay-signature");
  const body = await req.text();
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  if (signature !== expectedSignature) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  const event = JSON.parse(body);
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    // Fetch booking, get owner bank/UPI details, etc.
    const booking = await getBookingByOrderId(orderId);
    if (!booking) {
      console.error("Booking not found for orderId:", orderId);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Set paymentStatus to 'paid' after payment is captured
    console.log("Setting paymentStatus to 'paid' for booking:", booking._id);
    const updateResult = await Booking.findByIdAndUpdate(booking._id, { $set: { paymentStatus: 'paid' } });
    console.log("Update result for paymentStatus:", updateResult);

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
} 