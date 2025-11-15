import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import { verifySignature, razorpay } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body as {
      bookingId: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    // Extra safety: ensure the order matches the booking (if orderId already known)
    if (booking.orderId && booking.orderId !== razorpay_order_id) {
      return NextResponse.json({ error: 'Order does not match booking.' }, { status: 400 });
    }

    // Primary path: verify signature
    const isValid = verifySignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature });
    if (!isValid) {
      // Fallback: verify against Razorpay API if signature mismatches
      console.warn('Advance verify: signature mismatch. Attempting API validation fallback.', {
        bookingId,
        razorpay_order_id,
        razorpay_payment_id,
      });
      try {
        const payment = await (razorpay as any).payments.fetch(razorpay_payment_id);
        const order = await (razorpay as any).orders.fetch(razorpay_order_id);

        const paymentOk = payment && payment.order_id === razorpay_order_id && (payment.status === 'captured' || payment.status === 'authorized');
        const notes = order?.notes || {};
        const orderOk = order && notes && notes.bookingId === bookingId && (notes.type === 'advance' || !notes.type);

        if (!paymentOk || !orderOk) {
          console.error('Advance verify fallback failed', {
            paymentStatus: payment?.status,
            paymentOrderId: payment?.order_id,
            orderNotes: notes,
          });
          return NextResponse.json({ error: 'Payment validation failed.' }, { status: 400 });
        }
      } catch (apiErr) {
        console.error('Error during Razorpay API validation for advance payment', apiErr);
        return NextResponse.json({ error: 'Failed to validate payment with Razorpay.' }, { status: 500 });
      }
    }

    // Derive paid amount from Razorpay order and compute remaining
    let paidAmount: number | undefined;
    try {
      const order = await (razorpay as any).orders.fetch(razorpay_order_id);
      const amountPaise = typeof order?.amount === 'number' ? order.amount : undefined;
      paidAmount = typeof amountPaise === 'number' ? Math.round(amountPaise / 100) : undefined;
    } catch (orderErr) {
      console.warn('Failed to fetch Razorpay order to compute advance amount; falling back.', orderErr);
    }

    const totalAmount = typeof booking.totalPrice === 'number' ? booking.totalPrice : 0;
    const effectiveAdvance = typeof paidAmount === 'number'
      ? paidAmount
      : (booking.advancePaid ? Math.min(50000, Math.round(totalAmount * 0.5)) : 0);
    const computedRemaining = Math.max(0, totalAmount - (effectiveAdvance || 0));

    // Mark advance paid and move to owner confirmation; persist numeric amounts
    booking.advancePaid = true;
    booking.status = 'pending_owner_confirmation';
    booking.paymentStatus = 'pending';
    booking.advanceAmountPaid = effectiveAdvance || 0;
    booking.remainingAmount = computedRemaining;
    // Persist the Razorpay order/payment ids
    booking.orderId = razorpay_order_id;
    booking.paymentId = razorpay_payment_id;
    await booking.save();

    return NextResponse.json({
      message: 'Advance verified. Awaiting owner confirmation.',
      booking: {
        id: booking._id.toString(),
        status: booking.status,
        advancePaid: booking.advancePaid,
        paymentStatus: booking.paymentStatus,
      }
    });
  } catch (e: any) {
    console.error('bookings/verify-advance-payment error', e);
    return NextResponse.json({ error: 'Failed to verify advance payment.' }, { status: 500 });
  }
}