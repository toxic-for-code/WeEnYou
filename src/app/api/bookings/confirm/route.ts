import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { bookingId, action } = await req.json();

    if (!bookingId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Missing bookingId or invalid action' }, { status: 400 });
    }

    await connectDB();

    const booking = await Booking.findById(bookingId).populate('hallId');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Authorization: Check if the current user is the owner of the hall
    const hall = booking.hallId as any;
    if (hall.ownerId.toString() !== session.user.id) {
      console.error('[confirm] Unauthorized access attempt', {
        userId: session.user.id,
        ownerId: hall.ownerId,
        bookingId
      });
      return NextResponse.json({ error: 'Unauthorized: Only the hall owner can confirm bookings' }, { status: 403 });
    }

    if (action === 'approve') {
      booking.status = 'owner_confirmed';
      await Notification.create({
        userId: booking.userId,
        type: 'booking',
        message: `Your booking for '${hall.name}' has been approved by the owner. You can now pay the remaining balance.`,
      });
    } else {
      booking.status = 'rejected';
      await Notification.create({
        userId: booking.userId,
        type: 'booking',
        message: `Your booking for '${hall.name}' was unfortunately rejected by the owner. Any advance payment will be refunded.`,
      });
      // Note: Refund logic would typically be triggered here or via a dedicated refund process
    }

    await booking.save();

    console.log(`[confirm] Booking ${action}ed`, { bookingId, status: booking.status });

    return NextResponse.json({
      success: true,
      message: `Booking successfully ${action === 'approve' ? 'approved' : 'rejected'}.`,
      booking
    });

  } catch (error: any) {
    console.error('[confirm] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
