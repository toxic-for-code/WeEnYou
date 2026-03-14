import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import { razorpay } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    await connectDB();

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: session.user.id,
    }).populate('hallId') as any;

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // ── Pre-payment checks ──────────────────────────────────────────────────
    if (booking.status !== 'owner_confirmed') {
      return NextResponse.json({
        error: 'Remaining payment is only allowed after owner confirmation.',
        currentStatus: booking.status
      }, { status: 400 });
    }

    if (booking.remainingBalance <= 0) {
      return NextResponse.json({ error: 'No remaining balance to pay.' }, { status: 400 });
    }

    if (booking.finalPaymentStatus === 'paid') {
      return NextResponse.json({ error: 'Final payment has already been made.' }, { status: 400 });
    }

    // ── Create Razorpay Order ───────────────────────────────────────────────
    const order = await razorpay.orders.create({
      amount: Math.round(booking.remainingBalance * 100), // convert to paise
      currency: 'INR',
      receipt: `final_${bookingId.slice(-8)}_${Date.now()}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: session.user.id,
        hall: booking.hallId.name,
        type: 'final',
      },
    });

    // Save finalOrderId for webhook and verification lookup
    booking.finalOrderId = order.id;
    await booking.save();

    console.log('[create-final] Order created', {
      bookingId,
      orderId: order.id,
      amount: booking.remainingBalance
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error: any) {
    console.error('[create-final] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
