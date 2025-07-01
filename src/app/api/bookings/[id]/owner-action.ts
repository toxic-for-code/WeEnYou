import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    await connectDB();
    const booking = await Booking.findById(params.id).populate('hallId');
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    // Only hall owner can approve/reject
    if (booking.hallId.ownerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (booking.status !== 'pending_approval' || !booking.pendingChange) {
      return NextResponse.json({ error: 'No pending change to act on' }, { status: 400 });
    }
    const { action } = await req.json();
    if (action === 'approve') {
      if (booking.pendingChange.type === 'cancel') {
        booking.status = 'cancelled';
      } else if (booking.pendingChange.type === 'reschedule') {
        // Check for overlap with other bookings
        const overlap = await Booking.findOne({
          hallId: booking.hallId._id,
          _id: { $ne: booking._id },
          status: { $in: ['pending', 'confirmed'] },
          $or: [
            { startDate: { $lt: booking.pendingChange.endDate }, endDate: { $gt: booking.pendingChange.startDate } }
          ]
        });
        if (overlap) {
          return NextResponse.json({ error: 'Selected dates are not available' }, { status: 400 });
        }
        booking.startDate = booking.pendingChange.startDate;
        booking.endDate = booking.pendingChange.endDate;
        booking.status = 'confirmed';
      }
      // Notify user
      await Notification.create({
        userId: booking.userId,
        type: 'booking',
        message: `Your booking change request for hall '${booking.hallId.name}' was approved by the owner.`
      });
      booking.pendingChange = undefined;
      await booking.save();
      return NextResponse.json({ booking });
    } else if (action === 'reject') {
      // Revert to confirmed, clear pendingChange
      booking.status = 'confirmed';
      booking.pendingChange = undefined;
      await booking.save();
      // Notify user
      await Notification.create({
        userId: booking.userId,
        type: 'booking',
        message: `Your booking change request for hall '${booking.hallId.name}' was rejected by the owner.`
      });
      return NextResponse.json({ booking });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in owner-action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
 