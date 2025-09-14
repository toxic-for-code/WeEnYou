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
    // Accept/reject after advance payment (pending_owner_confirmation)
    if (booking.status !== 'pending_owner_confirmation') {
      return NextResponse.json({ error: 'Booking is not awaiting owner confirmation' }, { status: 400 });
    }
    const { action } = await req.json();
    if (action === 'approve') {
      booking.status = 'confirmed';
      await Notification.create({
        userId: booking.userId,
        type: 'booking',
        message: `Your booking for hall '${booking.hallId.name}' was accepted by the owner. Please pay the remaining amount to complete your booking.`
      });
      await booking.save();
      return NextResponse.json({ booking });
    } else if (action === 'reject') {
      booking.status = 'cancelled';
      await Notification.create({
        userId: booking.userId,
        type: 'booking',
        message: `Your booking for hall '${booking.hallId.name}' was rejected by the owner.`
      });
      await booking.save();
      return NextResponse.json({ booking });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in owner-action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
 