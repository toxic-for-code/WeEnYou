import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import BookingPayment from '@/models/BookingPayment';
import { verifySignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const {
      userId,
      hallId,
      totalAmount,
      advanceAmount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body as {
      userId: string; hallId: string; totalAmount: number; advanceAmount: number;
      razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
    };

    if (!userId || !hallId || !totalAmount || !advanceAmount || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const valid = verifySignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature });
    if (!valid) {
      return NextResponse.json({ error: 'Signature verification failed.' }, { status: 400 });
    }

    const remainingAmount = Math.max(0, totalAmount - advanceAmount);

    const booking = await BookingPayment.create({
      userId,
      hallId,
      totalAmount,
      advanceAmountRequested: advanceAmount,
      advanceAmountPaid: advanceAmount,
      advanceOrderId: razorpay_order_id,
      advancePaymentId: razorpay_payment_id,
      advancePaymentStatus: 'paid',
      remainingAmount,
      status: 'request_sent',
    });

    return NextResponse.json({
      message: 'Booking Request Sent!\nThank you for  your payment.\nPlease wait for the owner to accept  your request.\nYou’ll be notified once it’s accepted.',
      bookingId: booking._id.toString(),
    });
  } catch (e: any) {
    console.error('verify-advance-payment error', e);
    return NextResponse.json({ error: 'Failed to verify advance payment.' }, { status: 500 });
  }
}