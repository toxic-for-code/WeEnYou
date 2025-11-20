import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import BookingPayment from '@/models/BookingPayment';
import { razorpay } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const { bookingId } = body as { bookingId: string };
    if (!bookingId) return NextResponse.json({ error: 'Missing bookingId.' }, { status: 400 });

    const booking = await BookingPayment.findById(bookingId);
    if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    if (!booking.advancePaymentId || !booking.advanceAmountPaid) {
      return NextResponse.json({ error: 'No advance payment to refund.' }, { status: 400 });
    }

    // Refund the advance amount
    const refund = await razorpay.payments.refund(booking.advancePaymentId, {
      amount: Math.round((booking.advanceAmountPaid as number) * 100),
      // speed: 'optimum' // optional
    });

    booking.status = 'refunded';
    booking.advancePaymentStatus = 'refunded';
    booking.refundId = refund.id;
    await booking.save();

    return NextResponse.json({ message: 'Owner  declined. Refund initiated.', refundId: refund.id });
  } catch (e: any) {
    console.error('owner/decline error', e);
    return NextResponse.json({ error: 'Failed to decline booking and refund.' }, { status: 500 });
  }
}