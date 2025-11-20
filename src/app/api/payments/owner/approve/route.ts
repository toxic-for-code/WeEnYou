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
    if ((booking.remainingAmount ?? 0) <= 0) return NextResponse.json({ error: 'No remaining amount to collect.' }, { status: 400 });

    const order = await razorpay.orders.create({
      amount: Math.round((booking.remainingAmount as number) * 100),
      currency: 'INR',
      receipt: `rem_${Date.now()}`,
      notes: {
        bookingId: booking._id.toString(),
        type: 'remaining',
      },
    });

    booking.status = 'owner_approved';
    booking.remainingOrderId = order.id;
    booking.remainingPaymentStatus = 'open';
    await booking.save();

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (e: any) {
    console.error('owner/approve error', e);
    return NextResponse.json({ error: 'Failed to approve booking.' }, { status: 500 });
  }
}