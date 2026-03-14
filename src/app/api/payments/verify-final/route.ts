import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import { verifySignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookingId
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({
        error: 'Missing Razorpay response fields',
      }, { status: 400 });
    }

    // ── 1. Verify Razorpay signature ─────────────────────────────────────────
    const isValid = verifySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      console.error('[verify-final] Signature mismatch', { bookingId, razorpay_order_id });
      return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
    }

    // ── 2. Find the booking ──────────────────────────────────────────────────
    // Preference: Find by finalOrderId as requested by logic or orderId if fallback
    const booking = await Booking.findOne({
      $or: [{ finalOrderId: razorpay_order_id }, { _id: bookingId }],
      userId: session.user.id,
    }).populate('hallId') as any;

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // ── 3. Update status ─────────────────────────────────────────────────────
    booking.finalPaymentStatus = 'paid';
    booking.status = 'confirmed'; // Final state in the user's flow
    booking.paymentId = razorpay_payment_id; // Optionally update with latest paymentId
    booking.remainingBalance = 0;
    booking.paymentTimestamp = new Date(); // Update timestamp for final payment

    await booking.save();

    console.log('[verify-final] Final payment verified and booking confirmed', {
      bookingId: booking._id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });

    // Notify user
    await Notification.create({
      userId: booking.userId,
      type: 'booking',
      message: `Full payment captured for your booking at '${booking.hallId.name}'. Your booking is now fully confirmed!`,
    });

    return NextResponse.json({
      success: true,
      message: 'Final payment verified. Your booking is fully confirmed.',
      booking
    });

  } catch (error: any) {
    console.error('[verify-final] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
