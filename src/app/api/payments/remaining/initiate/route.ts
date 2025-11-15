import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import BookingPayment from '@/models/BookingPayment';
import { razorpay } from '@/lib/razorpay';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions as any);
    const userId = (session as any)?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId } = body as { bookingId: string };
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required.' }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }
    if (booking.userId?.toString() !== userId) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }
    const allowed = ['confirmed', 'approved'];
    if (!allowed.includes(booking.status)) {
      return NextResponse.json({ error: 'Booking not approved.' }, { status: 400 });
    }

    // Find the BookingPayment record for this user and hall
    let bp = await BookingPayment.findOne({ userId: booking.userId, hallId: booking.hallId });
    if (!bp) {
      // Create a minimal record if missing, with amounts from booking
      const advancePaid = booking.advanceAmountPaid || 0;
      const totalPrice = booking.totalPrice || 0;
      const remaining = booking.remainingAmount ?? Math.max(totalPrice - advancePaid, 0);
      
      bp = await BookingPayment.create({
        userId: booking.userId,
        hallId: booking.hallId,
        totalAmount: totalPrice,
        advanceAmountRequested: advancePaid,
        advanceAmountPaid: advancePaid,
        remainingAmount: remaining,
        status: 'owner_approved',
        advancePaymentStatus: booking.advancePaid ? 'paid' : 'pending',
        remainingPaymentStatus: 'open',
      });
    }

    // Use remainingAmount from booking if available, otherwise calculate
    const remainingAmount = booking.remainingAmount ?? Math.max((booking.totalPrice || 0) - (booking.advanceAmountPaid || 0), 0);
    if (!remainingAmount || remainingAmount <= 0) {
      return NextResponse.json({ error: 'No remaining amount due.' }, { status: 400 });
    }

    // Round to 2 decimal places and convert to paise
    const amountInPaise = Math.round(remainingAmount * 100);
    if (amountInPaise < 100) {
      return NextResponse.json({ error: 'Amount too small. Minimum payment is ₹1.' }, { status: 400 });
    }

    // If an unpaid order already exists, verify it matches the current amount
    if (bp.remainingOrderId && bp.remainingPaymentStatus !== 'paid') {
      try {
        const existingOrder = await (razorpay as any).orders.fetch(bp.remainingOrderId);
        // If order amount matches, reuse it; otherwise create a new one
        if (existingOrder.amount === amountInPaise && existingOrder.status === 'created') {
          return NextResponse.json({
            bookingPaymentId: bp._id.toString(),
            orderId: bp.remainingOrderId,
            amount: existingOrder.amount,
            currency: existingOrder.currency || 'INR',
          });
        }
      } catch (err) {
        console.warn('Could not fetch existing order, creating new one:', err);
      }
    }

    // Create a new Razorpay order for remaining amount
    console.log('Creating Razorpay order for remaining payment:', {
      bookingId,
      remainingAmount,
      amountInPaise,
      userId: booking.userId?.toString(),
    });

    // Create a short receipt (max 40 chars for Razorpay)
    // Format: rem_<last12charsOfBookingId>_<timestamp>
    const shortBookingId = bookingId.slice(-12); // Last 12 chars of bookingId
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const receipt = `rem_${shortBookingId}_${timestamp}`; // Max: 4 + 12 + 1 + 8 = 25 chars
    
    const order = await (razorpay as any).orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt,
      notes: { type: 'remaining', bookingId },
      payment_capture: 1,
    });

    console.log('Razorpay order created:', {
      orderId: order.id,
      amount: order.amount,
      status: order.status,
    });

    bp.remainingOrderId = order.id;
    bp.remainingPaymentStatus = 'open';
    await bp.save();

    return NextResponse.json({
      bookingPaymentId: bp._id.toString(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (e: any) {
    console.error('remaining/initiate error', e);
    const errorMessage = e.message || e.error?.description || 'Failed to initiate remaining payment.';
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? e.stack : undefined
    }, { status: 500 });
  }
}