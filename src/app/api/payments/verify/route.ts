import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import ServiceBooking from '@/models/ServiceBooking';
import Notification from '@/models/Notification';
import { verifySignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/verify
 *
 * Verifies a Razorpay payment after the frontend checkout completes.
 * Supports both advance payments (pending_advance → owner_approval_pending)
 * and full payments (→ confirmed).
 *
 * Body:
 *   razorpay_payment_id  – from Razorpay handler response
 *   razorpay_order_id    – from Razorpay handler response
 *   razorpay_signature   – from Razorpay handler response
 *   bookingId            – MongoDB _id of the Booking
 *   type                 – "advance" | "final" (defaults to "advance")
 *   serviceBookingIds    – optional array of ServiceBooking _ids (for full payment)
 *   advanceAmount        – amount paid as advance (for advance type)
 */
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
      bookingId,
      type = 'advance',
      serviceBookingIds = [],
      advanceAmount,
    } = await req.json();

    // ── 1. Validate required fields ──────────────────────────────────────────
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({
        error: 'Missing Razorpay payment fields (payment_id, order_id, signature)',
      }, { status: 400 });
    }

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }

    // ── 2. Verify Razorpay signature (HMAC SHA256) ───────────────────────────
    const isValid = verifySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      console.error('[verify] Signature mismatch', { bookingId, razorpay_order_id, razorpay_payment_id });
      return NextResponse.json({ error: 'Payment signature verification failed. Payment may be tampered.' }, { status: 400 });
    }

    console.log('[verify] Signature valid', { bookingId, razorpay_order_id, razorpay_payment_id, type });

    // ── 3. Find the booking ──────────────────────────────────────────────────
    // Preference: Find by Razorpay orderId as requested by the user
    let booking = await Booking.findOne({
      orderId: razorpay_order_id,
      userId: session.user.id,
    }).populate('hallId') as any;

    // Fallback: Find by bookingId if provided and orderId lookup failed
    if (!booking && bookingId) {
      booking = await Booking.findOne({
        _id: bookingId,
        userId: session.user.id,
      }).populate('hallId') as any;
    }

    if (!booking) {
      console.error('[verify] Booking not found', { bookingId, razorpay_order_id });
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // ── 4. Apply updates based on payment type ───────────────────────────────
    if (type === 'advance') {
      const paidAdvance = advanceAmount || booking.advanceAmount || Math.min(booking.totalPrice * 0.5, 50000);
      const remaining   = Math.max(0, booking.totalPrice - paidAdvance);

      booking.advancePaid       = true;
      booking.advanceAmount     = paidAdvance;
      booking.remainingBalance  = remaining;
      booking.paymentId         = razorpay_payment_id;
      booking.orderId           = razorpay_order_id;
      booking.paymentTimestamp  = new Date();
      booking.paymentStatus     = 'paid' as any; // Marking advance step as paid
      booking.status            = 'waiting_owner_confirmation' as any;
      await booking.save();

      console.log('[verify] Advance payment recorded', {
        bookingId: booking._id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        newStatus: booking.status,
        newPaymentStatus: booking.paymentStatus,
      });

      // Notify hall owner
      if (booking.hallId?.ownerId) {
        await Notification.create({
          userId: booking.hallId.ownerId,
          type: 'booking',
          message: `Advance payment received for booking at '${booking.hallId.name}'. Please confirm or reject the booking.`,
        });
      }

      const fresh = await Booking.findById(booking._id).populate('hallId');
      return NextResponse.json({
        success: true,
        message: 'Advance payment verified. Waiting for owner confirmation.',
        booking: fresh,
      });

    } else if (type === 'final') {
      booking.paymentId        = razorpay_payment_id;
      booking.orderId          = razorpay_order_id;
      booking.paymentTimestamp = new Date();
      booking.paymentStatus    = 'paid' as any;
      booking.finalPaymentStatus = 'paid';
      booking.remainingBalance = 0;
      booking.status           = 'completed' as any;
      await booking.save();

      // Update any linked service bookings
      if (serviceBookingIds && serviceBookingIds.length > 0) {
        await ServiceBooking.updateMany(
          { _id: { $in: serviceBookingIds } },
          { paymentStatus: 'paid', status: 'confirmed', paymentId: razorpay_payment_id }
        );
      }

      console.log('[verify] Final payment recorded', {
        bookingId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        newStatus: booking.status,
      });

      await Notification.create({
        userId: booking.userId,
        type: 'booking',
        message: `Your booking at '${booking.hallId?.name || 'the hall'}' is fully paid and confirmed. Enjoy your event!`,
      });

      const fresh = await Booking.findById(bookingId).populate('hallId');
      return NextResponse.json({
        success: true,
        message: 'Final payment verified. Booking completed.',
        booking: fresh,
      });

    } else {
      return NextResponse.json({ error: `Unknown payment type: ${type}. Use "advance" or "final".` }, { status: 400 });
    }

  } catch (error: any) {
    console.error('[verify] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error during payment verification.' }, { status: 500 });
  }
}
