import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import { sendCancellationEmail } from '@/lib/email';
import Hall from '@/models/Hall';
import Notification from '@/models/Notification';

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

    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Only confirmed bookings can be cancelled' },
        { status: 400 }
      );
    }

    // Check if cancellation is allowed (e.g., 7 days before check-in)
    const checkInDate = new Date(booking.startDate);
    const today = new Date();
    const daysUntilCheckIn = Math.ceil(
      (checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilCheckIn < 7) {
      return NextResponse.json(
        { error: 'Bookings can only be cancelled up to 7 days before check-in' },
        { status: 400 }
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

    // Send cancellation email
    await sendCancellationEmail({
      to: session.user.email!,
      bookingId: booking._id,
      hallName: booking.hallId.name,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalPrice: booking.totalPrice,
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
 