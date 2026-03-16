import Razorpay from 'razorpay';
import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

async function findBookingByOrderId(orderId: string) {
  await connectDB();
  return Booking.findOne({ orderId }).populate('hallId');
}

async function findBookingByNote(bookingId: string) {
  await connectDB();
  return Booking.findById(bookingId).populate('hallId');
}

// ────────────────────────────────────────────────────────────────────────────
// Webhook handler
// ────────────────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    // 1. Verify webhook signature
    const expectedSig = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSig) {
      console.error('[webhook] Signature mismatch', { received: signature, expected: expectedSig });
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log('[webhook] Event received:', event.event);

    // ────────────────────────────────────────────────────────────────────────
    // payment.captured — advance or final payment collected
    // ────────────────────────────────────────────────────────────────────────
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId   = payment.order_id as string;
      const paymentId = payment.id         as string;
      const notes     = (payment.notes || {}) as Record<string, string>;
      const paymentType = notes.type || 'advance';

      console.log('[webhook] payment.captured', { orderId, paymentId, type: paymentType, notes });

      // Find booking: primary = orderId field; fallback = notes.bookingId
      let booking: any = await findBookingByOrderId(orderId);
      if (!booking && notes.bookingId) {
        console.log('[webhook] Fallback: looking up by notes.bookingId', notes.bookingId);
        booking = await findBookingByNote(notes.bookingId);
        if (booking) {
          // Persist the orderId so future lookups work
          booking.orderId = orderId;
        }
      }

      if (!booking) {
        console.error('[webhook] Booking not found', { orderId, bookingIdNote: notes.bookingId });
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      console.log('[webhook] Booking found', {
        bookingId: booking._id,
        currentStatus: booking.status,
        currentPaymentStatus: booking.paymentStatus,
      });

      // ── Advance payment ──────────────────────────────────────────────────
      if (paymentType === 'advance') {
        const capturedAmount   = payment.amount / 100; // paise → rupees
        const totalBookingPrice = booking.totalPrice || 0;
        
        // Ensure advanceAmount is never 0 if a payment was captured
        const finalAdvanceAmount = capturedAmount || booking.advanceAmount || Math.min(totalBookingPrice * 0.5, 50000);
        const remainingBalance   = Math.max(0, totalBookingPrice - finalAdvanceAmount);

        console.log('[webhook] Recording advance payment', { 
          bookingId: booking._id, 
          capturedAmount, 
          finalAdvanceAmount, 
          remainingBalance 
        });

        await Booking.findByIdAndUpdate(booking._id, {
          $set: {
            'payment.advancePaid':      true,
            'payment.advanceAmount':    finalAdvanceAmount,
            'payment.remainingBalance': remainingBalance,
            'payment.paymentId':        paymentId,
            'payment.orderId':          orderId,
            'payment.paymentTimestamp': new Date(),
            'payment.paymentStatus':    'paid',
            status:                     'waiting_owner_confirmation',
          },
        }, { new: true });

        console.log('[webhook] Advance payment updated', {
          bookingId: booking._id,
          advanceAmount: finalAdvanceAmount,
          remainingBalance,
          newStatus: 'waiting_owner_confirmation',
        });

        // Notify owner
        const hallName = (booking.hallId as any)?.name || 'the hall';
        const ownerId  = (booking.hallId as any)?.ownerId;
        if (ownerId) {
          await Notification.create({
            userId: ownerId,
            type: 'booking',
            message: `Advance payment of ₹${finalAdvanceAmount.toLocaleString()} received for '${hallName}'. Please confirm or reject the booking.`,
          });
        }

        return NextResponse.json({ status: 'Advance payment recorded. Booking processing.' });

      // ── Final / full payment ─────────────────────────────────────────────
      } else if (paymentType === 'final' || paymentType === 'remaining') {
        await Booking.findByIdAndUpdate(booking._id, {
          $set: {
            'payment.paymentId':        paymentId,
            'payment.orderId':          orderId,
            'payment.paymentTimestamp': new Date(),
            'payment.paymentStatus':    'paid',
            'payment.remainingBalance': 0,
            finalPaymentStatus:         'paid',
            status:                     'confirmed',
          },
        }, { new: true });

        console.log('[webhook] Final payment updated', { bookingId: booking._id, newStatus: 'confirmed' });

        await Notification.create({
          userId: booking.userId,
          type: 'booking',
          message: `Your booking at '${(booking.hallId as any)?.name || 'the hall'}' is fully paid. Enjoy your event!`,
        });

        // Trigger owner payout only when all details are available
        const ownerContactId    = booking.ownerContactId;
        const ownerFundAcctId   = booking.ownerFundAccountId;
        const venuePrice        = booking.venuePrice ?? 0;

        if (ownerFundAcctId && venuePrice > 0) {
          try {
            const payout = await (razorpay as any).payouts.create({
              account_number: process.env.RAZORPAY_PAYOUT_ACCOUNT_NUMBER,
              fund_account_id: ownerFundAcctId,
              amount: Math.round(venuePrice * 100),
              currency: 'INR',
              mode: booking.ownerBankDetails?.upi ? 'upi' : 'imps',
              purpose: 'vendor_payment',
              queue_if_low_balance: true,
              narration: 'Venue Booking Payout',
              notes: { bookingId: booking._id.toString() },
            });
            await Booking.findByIdAndUpdate(booking._id, {
              $set: { payoutId: payout.id, payoutStatus: payout.status },
            });
            console.log('[webhook] Payout triggered', { bookingId: booking._id, payoutId: payout.id });
          } catch (payoutErr: any) {
            // Payout failure must NOT fail the webhook response
            console.error('[webhook] Payout failed (non-fatal)', payoutErr?.message);
          }
        } else {
          console.warn('[webhook] Skipping payout — owner fund account or venue price not set', {
            bookingId: booking._id, ownerFundAcctId, venuePrice,
          });
        }

        return NextResponse.json({ status: 'Final payment recorded. Booking completed.' });

      } else {
        // Unknown type — treat as advance (safe default)
        console.warn('[webhook] Unknown payment type, defaulting to advance', { paymentType });
        await Booking.findByIdAndUpdate(booking._id, {
          $set: {
            'payment.advancePaid':      true,
            'payment.paymentId':        paymentId,
            'payment.orderId':          orderId,
            'payment.paymentTimestamp': new Date(),
            'payment.paymentStatus':    'paid',
            status:                     'waiting_owner_confirmation',
          },
        });
        return NextResponse.json({ status: 'Payment recorded as advance (default).' });
      }
    }

    // ── Payout status events ─────────────────────────────────────────────────
    if (event.event === 'payout.processed') {
      const payout = event.payload.payout.entity;
      await Booking.findOneAndUpdate({ payoutId: payout.id }, { $set: { payoutStatus: 'processed' } });
      console.log('[webhook] Payout processed', { payoutId: payout.id });
      return NextResponse.json({ status: 'Payout processed' });
    }

    if (event.event === 'payout.failed') {
      const payout = event.payload.payout.entity;
      await Booking.findOneAndUpdate({ payoutId: payout.id }, { $set: { payoutStatus: 'failed' } });
      console.error('[webhook] Payout failed', { payoutId: payout.id });
      return NextResponse.json({ status: 'Payout failed noted' });
    }

    console.log('[webhook] Ignored event:', event.event);
    return NextResponse.json({ status: 'Ignored' });

  } catch (error: any) {
    console.error('[webhook] Unhandled error:', error?.message, error?.stack);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}