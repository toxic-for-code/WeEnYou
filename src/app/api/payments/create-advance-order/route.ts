import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import connectToDB from '@/lib/db';
import Hall from '@/models/Hall';

function calcRequiredAdvance(totalAmount: number) {
  return Math.min(totalAmount * 0.5, 50000);
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const { userId, hallId, totalAmount, advance } = body as { userId: string; hallId: string; totalAmount: number; advance: number; };

    if (!userId || !hallId || !totalAmount || !advance) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const hall = await Hall.findById(hallId).lean();
    if (!hall) return NextResponse.json({ error: 'Hall not found.' }, { status: 404 });

    const requiredAdvance = calcRequiredAdvance(totalAmount);
    // Use hall-provided bounds if available, otherwise default to sensible values
    const minAdvance = typeof (hall as any).minAdvance === 'number' ? (hall as any).minAdvance : requiredAdvance;
    const maxAdvance = typeof (hall as any).maxAdvance === 'number' ? (hall as any).maxAdvance : totalAmount;

    const valid = advance >= minAdvance && advance <= maxAdvance && advance >= requiredAdvance;
    if (!valid) {
      return NextResponse.json({
        error: 'Invalid advance amount.',
        details: {
          minAdvance,
          maxAdvance,
          requiredAdvance,
        },
      }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(advance * 100),
      currency: 'INR',
      receipt: `adv_${Date.now()}`,
      notes: {
        userId,
        hallId,
        totalAmount: String(totalAmount),
        advanceRequested: String(advance),
        type: 'advance',
      },
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (e: any) {
    console.error('create-advance-order error', e);
    return NextResponse.json({ error: 'Failed to create advance order.' }, { status: 500 });
  }
}