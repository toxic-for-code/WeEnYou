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

    const { reason } = await request.json();

    // Update booking status to request
    booking.status = 'cancellation_requested';
    booking.cancellationRequested = true;
    booking.cancellationRequestedBy = 'user';
    booking.cancellationReason = reason || '';
    booking.cancellationRequestedAt = new Date();
    
    await booking.save();

    // Notify owner
    const hall = await Hall.findById(booking.hallId);
    if (hall) {
      await Notification.create({
        userId: hall.ownerId,
        type: 'cancellation_request',
        message: `Cancellation requested for ${hall.name} (${new Date(booking.startDate).toLocaleDateString('en-IN')} to ${new Date(booking.endDate).toLocaleDateString('en-IN')}) by the user. Reason: ${reason || 'Not provided'}`,
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
 