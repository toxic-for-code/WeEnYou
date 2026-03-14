import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import BookingPayment from '@/models/BookingPayment';
import Notification from '@/models/Notification';
import { razorpay } from '@/lib/razorpay';
import { HallDoc } from '@/models/Hall';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    await connectDB();
    const booking = await Booking.findById(params.id).populate('hallId') as any;
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    // Only hall owner can approve/reject
    if ((booking.hallId as HallDoc).ownerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    // Accept/reject when booking is awaiting owner approval
    const awaitingApproval = ['pending_owner_confirmation', 'owner_approval_pending'];
    if (!awaitingApproval.includes(booking.status)) {
      return NextResponse.json({ error: 'Booking is not currently processing' }, { status: 400 });
    }
    const { action } = await req.json();

    if (action === 'approve') {
      booking.status = 'confirmed';
      await booking.save();

      // Also update the linked BookingPayment if it exists
      if (booking.bookingPaymentId) {
        await BookingPayment.findByIdAndUpdate(booking.bookingPaymentId, { status: 'owner_approved' });
      }

      await Notification.create({
        userId: booking.userId,
        type: 'booking',
        message: `Your booking for '${(booking.hallId as HallDoc).name}' was approved! Please pay the remaining balance of ₹${booking.remainingBalance || 0} to complete your booking.`,
      });
      return NextResponse.json({ booking });

    } else if (action === 'reject') {
      booking.status = 'rejected';
      booking.paymentStatus = 'refund_pending';
      await booking.save();

      let refundId: string | null = null;

      // Refund the advance via BookingPayment record
      if (booking.bookingPaymentId) {
        const bp = await BookingPayment.findById(booking.bookingPaymentId);
        if (bp && bp.advancePaymentId && bp.advanceAmountPaid) {
          try {
            const refund = await razorpay.payments.refund(bp.advancePaymentId, {
              amount: Math.round((bp.advanceAmountPaid as number) * 100),
            });
            bp.status = 'refunded';
            bp.advancePaymentStatus = 'refunded';
            bp.refundId = refund.id;
            await bp.save();
            refundId = refund.id;

            // Mark booking as refunded once the refund is initiated
            booking.paymentStatus = 'refund_pending';
            await booking.save();
          } catch (refundErr) {
            console.error('Refund failed:', refundErr);
            // Don't block rejection if refund fails — status stays refund_pending
          }
        }
      } else if (booking.paymentId) {
        // Fallback: attempt direct refund on the booking's paymentId
        try {
          const refund = await razorpay.payments.refund(booking.paymentId, {
            amount: Math.round((booking.advanceAmount || 0) * 100),
          });
          refundId = refund.id;
        } catch (refundErr) {
          console.error('Direct refund failed:', refundErr);
        }
      }

      await Notification.create({
        userId: booking.userId,
        type: 'booking',
        message: `Your booking for '${(booking.hallId as HallDoc).name}' was rejected by the owner. Your advance payment of ₹${booking.advanceAmount || 0} will be refunded.`,
      });
      return NextResponse.json({ booking, refundId });

    } else {
      return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject".' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in owner-action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}