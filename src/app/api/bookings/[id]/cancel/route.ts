import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import Hall from '@/models/Hall';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const booking = await Booking.findOne({
      _id: params.id,
      userId: session.user.id,
    }).populate('hallId', 'name images location');

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Notify owner
    const hall = await Hall.findById(booking.hallId);
    if (hall) {
      await Notification.create({
        userId: hall.ownerId,
        type: 'cancellation',
        message: `Booking for ${hall.name} (${booking.startDate} to ${booking.endDate}) was cancelled by the user.`,
      });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
 