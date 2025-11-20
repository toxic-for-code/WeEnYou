import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import BookingPayment from '@/models/BookingPayment';
import { verifySignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as {
      bookingId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
    };
    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const valid = verifySignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature });
    if (!valid) {
      return NextResponse.json({ error: 'Signature verification failed.' }, { status: 400 });
    }

    const booking = await BookingPayment.findById(bookingId);
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });

    booking.remainingPaymentStatus = 'paid';
    booking.status = 'completed';
    await booking.save();

    return NextResponse.json({ message: 'Remaining amount paid. Booking Completed.', bookingId: booking._id.toString() });
  } catch (e: any) {
    console.error('verify-remaining-payment error', e);
    return NextResponse.json({ error: 'Failed to verify remaining payment.' }, { status: 500 });
  }
}