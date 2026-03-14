import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { razorpay } from '@/lib/razorpay';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import Hall from '@/models/Hall';

function calcRequiredAdvance(totalAmount: number) {
  return Math.min(totalAmount * 0.5, 50000);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { bookingId, userId, hallId, totalAmount, advance } = body as {
      bookingId?: string;
      userId: string;
      hallId: string;
      totalAmount: number;
      advance: number;
    };

    if (!userId || !hallId || !totalAmount || !advance) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const hall = await Hall.findById(hallId).lean();
    if (!hall) return NextResponse.json({ error: 'Hall not found.' }, { status: 404 });

    const requiredAdvance = calcRequiredAdvance(totalAmount);
    const minAdvance = typeof (hall as any).minAdvance === 'number' ? (hall as any).minAdvance : requiredAdvance;
    const maxAdvance = typeof (hall as any).maxAdvance === 'number' ? (hall as any).maxAdvance : totalAmount;

    const valid = advance >= minAdvance && advance <= maxAdvance && advance >= requiredAdvance;
    if (!valid) {
      return NextResponse.json({
        error: 'Invalid advance amount.',
        details: { minAdvance, maxAdvance, requiredAdvance },
      }, { status: 400 });
    }

    // Create Razorpay order — embed bookingId in notes for webhook fallback
    const order = await razorpay.orders.create({
      amount: Math.round(advance * 100),
      currency: 'INR',
      receipt: bookingId ? `adv_${bookingId.slice(-8)}_${Date.now()}` : `adv_${Date.now()}`,
      notes: {
        userId,
        hallId,
        bookingId: bookingId || '',
        totalAmount: String(totalAmount),
        advanceRequested: String(advance),
        type: 'advance',
      },
    });

    console.log('[create-advance-order] Order created', { orderId: order.id, bookingId, hallId, advance });

    // Save orderId back to the Booking document so the webhook can find it via orderId
    if (bookingId) {
      const result = await Booking.findByIdAndUpdate(bookingId, { $set: { orderId: order.id } });
      console.log('[create-advance-order] orderId saved to booking', { bookingId, orderId: order.id, found: !!result });
    }

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (e: any) {
    console.error('[create-advance-order] Error:', e);
    return NextResponse.json({ error: 'Failed to create advance order.' }, { status: 500 });
  }
}