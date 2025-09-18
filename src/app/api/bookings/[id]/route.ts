import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import ServiceBooking from '@/models/ServiceBooking';
import Notification from '@/models/Notification';
import { HallDoc } from '@/models/Hall';

export const dynamic = 'force-dynamic';

export async function GET(
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
    }).populate('hallId', 'name images location amenities description ownerId') as any;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const booking = await Booking.findOne({
      _id: params.id,
      userId: session.user.id,
    }).populate('hallId') as any;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const updates = await req.json();

    // Handle payment updates
    if (updates.paymentStatus === 'paid' && updates.serviceBookingIds) {
      // Update hall booking payment status
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      if (updates.paymentId) {
        booking.paymentId = updates.paymentId;
      }
      await booking.save();

      // Update service bookings payment status
      await ServiceBooking.updateMany(
        { _id: { $in: updates.serviceBookingIds } },
        {
          paymentStatus: 'paid',
          status: 'confirmed',
          paymentId: updates.paymentId
        }
      );

      // Get updated booking with populated fields
      const updatedBooking = await Booking.findById(booking._id)
        .populate('hallId')
        .populate('userId');

      return NextResponse.json({ booking: updatedBooking });
    }

    // If user requests reschedule or cancel, create pending approval
    if (updates.startDate || updates.endDate || updates.status === 'cancelled') {
      // Only allow if booking is confirmed and >48h before start
      if (booking.status !== 'confirmed') {
        return NextResponse.json(
          { error: 'Only confirmed bookings can be changed' },
          { status: 400 }
        );
      }
      const now = new Date();
      if ((new Date(booking.startDate).getTime() - now.getTime()) < 48 * 60 * 60 * 1000) {
        return NextResponse.json(
          { error: 'Cannot modify booking less than 48 hours before start' },
          { status: 400 }
        );
      }
      // Prepare pendingChange
      let pendingChange: any = { requestedAt: new Date() };
      if (updates.status === 'cancelled') {
        pendingChange.type = 'cancel';
      } else {
        pendingChange.type = 'reschedule';
        pendingChange.startDate = updates.startDate ? new Date(updates.startDate) : booking.startDate;
        pendingChange.endDate = updates.endDate ? new Date(updates.endDate) : booking.endDate;
        if (pendingChange.endDate <= pendingChange.startDate) {
          return NextResponse.json(
            { error: 'End date must be after start date' },
            { status: 400 }
          );
        }
      }
      booking.status = 'pending_approval';
      booking.pendingChange = pendingChange;
      await booking.save();
      // Notify owner
      if ((booking.hallId as HallDoc).ownerId) {
        await Notification.create({
          userId: (booking.hallId as HallDoc).ownerId,
          type: 'booking',
          message: `Booking for your hall '${(booking.hallId as HallDoc).name}' has a pending ${pendingChange.type} request.`,
        });
      }
      return NextResponse.json({ booking });
    }

    // Otherwise, allow only specialRequests update
    const allowedUpdates = ['specialRequests', 'finalPaymentStatus', 'finalPaymentMethod'];
    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        booking[key] = updates[key];
      }
    });

    await booking.save();
    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
 