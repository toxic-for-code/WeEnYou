import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import BookingPayment from '@/models/BookingPayment';
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
    // Accept/reject after advance payment (pending_owner_confirmation)
    if (booking.status !== 'pending_owner_confirmation') {
      return NextResponse.json({ error: 'Booking is not awaiting owner confirmation' }, { status: 400 });
    }
    const { action, remarks } = await req.json();
    if (action === 'approve') {
      booking.status = 'confirmed';
      if (typeof remarks === 'string' && remarks.trim().length > 0) {
        booking.ownerRemarks = remarks.trim();
      }
      await Notification.create({
        userId: booking.userId,
        type: 'booking',
        message: `Your booking for hall '${(booking.hallId as HallDoc).name}' was accepted by the owner. Please pay the remaining amount to complete your booking.` + (remarks && remarks.trim() ? ` Owner remarks: ${remarks.trim()}` : '')
      });
      await booking.save();

      // Also mark payment record owner-approved and open remaining payment if needed
      try {
        const payment = await BookingPayment.findOne({ userId: booking.userId, hallId: booking.hallId }).sort({ createdAt: -1 });
        if (payment) {
          // If there's remaining to collect and not already paid, open a Razorpay order
          const remaining = typeof payment.remainingAmount === 'number' ? payment.remainingAmount : (typeof booking.remainingAmount === 'number' ? booking.remainingAmount : 0);
          if (remaining > 0 && payment.remainingPaymentStatus !== 'paid') {
            const order = await razorpay.orders.create({
              amount: Math.round(remaining * 100),
              currency: 'INR',
              receipt: `rem_${Date.now()}`,
              notes: {
                bookingId: booking._id.toString(),
                type: 'final',
              },
            });
            payment.status = 'owner_approved';
            payment.remainingOrderId = order.id;
            payment.remainingPaymentStatus = 'open';
            await payment.save();
          } else {
            // No remaining amount, mark completed
            payment.status = 'completed';
            payment.remainingPaymentStatus = 'paid';
            await payment.save();
          }
        }
      } catch (pmErr) {
        console.error('Failed to update BookingPayment on owner approve', pmErr);
      }

      return NextResponse.json({ booking });
    } else if (action === 'reject') {
      booking.status = 'cancelled';
      if (typeof remarks === 'string' && remarks.trim().length > 0) {
        booking.ownerRemarks = remarks.trim();
      }
      await Notification.create({
        userId: booking.userId,
        type: 'booking',
        message: `Your booking for hall '${(booking.hallId as HallDoc).name}' was rejected by the owner.` + (remarks && remarks.trim() ? ` Owner remarks: ${remarks.trim()}` : '')
      });
      await booking.save();
      // Persist decline on payment record (refund is handled by payments/owner/decline)
      try {
        await BookingPayment.findOneAndUpdate(
          { userId: booking.userId, hallId: booking.hallId },
          { $set: { status: 'owner_declined' } }
        );
      } catch (pmErr) {
        console.error('Failed to update BookingPayment on owner reject', pmErr);
      }
      return NextResponse.json({ booking });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in owner-action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
 