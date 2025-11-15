import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import Service from '@/models/Service';
import ServiceBooking from '@/models/ServiceBooking';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { hallId, startDate, endDate, guests, specialRequests, services = [], servicesTotal = 0, totalAmount } = await req.json();

    // Removed verbose request body logging

    // Validate required fields
    if (!hallId || !startDate || !endDate || !guests) {
      console.error('Booking error: Missing required fields', { hallId, startDate, endDate, guests });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if hall exists
    const hall = await Hall.findById(hallId);
    if (!hall) {
      console.error('Booking error: Hall not found', { hallId });
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    // Check if dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      console.error('Booking error: Start date in the past', { startDate });
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }

    if (end < start) {
      console.error('Booking error: End date before start date', { startDate, endDate });
      return NextResponse.json(
        { error: 'End date must not be before start date' },
        { status: 400 }
      );
    }

    // Check if hall is available for the selected dates
    const existingBooking = await Booking.findOne({
      hallId,
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start },
        },
      ],
      status: { $in: ['confirmed'] },
    });

    if (existingBooking) {
      console.log('Conflicting booking:', existingBooking);
      return NextResponse.json(
        { error: 'Hall is not available for the selected dates' },
        { status: 400 }
      );
    }

    // Calculate total price for hall only (do not include services)
    const hallPrice = hall.price * Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    // Use totalAmount from frontend if provided, else fallback to hallPrice
    const totalPrice = typeof totalAmount === 'number' ? totalAmount : hallPrice;

    // Fetch user info for snapshot (phone may not be in session)
    const userDoc = await User.findById(session.user.id).select('phone name email');

    // Create booking
    const booking = await Booking.create({
      userId: session.user.id,
      hallId,
      ownerId: hall.ownerId,
      startDate,
      endDate,
      guests,
      specialRequests,
      userName: session.user.name || userDoc?.name,
      userEmail: session.user.email || userDoc?.email,
      userPhone: userDoc?.phone,
      totalPrice, // This now includes all fees if provided
      status: 'pending_advance',
      advancePaid: false,
      finalPaymentMethod: null,
      finalPaymentStatus: null,
    });

    // Create service bookings if any
    if (services.length > 0) {
      const serviceBookingPromises = services.map(async (service: { name: string; price: number }) => {
        // Find the service in the database
        const dbService = await Service.findOne({ name: service.name, price: service.price });
        if (dbService) {
          return ServiceBooking.create({
            userId: session.user.id,
            serviceId: dbService._id,
            providerId: dbService.providerId,
            hallId,
            hallBookingId: booking._id,
            startDate,
            endDate,
            totalPrice: service.price,
            status: 'pending',
            paymentStatus: 'pending',
          });
        }
      });

      await Promise.all(serviceBookingPromises);
    }

    // Notify owner
    await Notification.create({
      userId: hall.ownerId,
      type: 'booking',
      message: `New booking for ${hall.name} from ${session.user.name || 'a user'} (${startDate} to ${endDate})`,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    let bookings;
    if (session.user.role === 'owner') {
      // Owner: get all bookings for their halls
      const halls = await Hall.find({ ownerId: session.user.id });
      const hallIds = halls.map(h => h._id);
      bookings = await Booking.find({ hallId: { $in: hallIds } })
        .populate('hallId', 'name images location amenities ownerId')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // User: get their own bookings
      bookings = await Booking.find({ userId: session.user.id })
        .populate('hallId', 'name images location amenities ownerId')
        .sort({ createdAt: -1 })
        .lean();
    }

    // For each booking, populate serviceBookings with providerId
    const bookingsWithServices = await Promise.all(bookings.map(async (booking) => {
      const serviceBookings = await ServiceBooking.find({ hallBookingId: booking._id })
        .populate('providerId', 'name')
        .lean();
      booking.serviceBookings = serviceBookings;
      return booking;
    }));

    return NextResponse.json({ bookings: bookingsWithServices });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
 