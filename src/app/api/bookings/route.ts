import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import Service from '@/models/Service';
import ServiceBooking from '@/models/ServiceBooking';

import Settings from '@/models/Settings';

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

    const { 
      hallId, 
      startDate, 
      endDate, 
      eventStartTime,
      eventType,
      guests, 
      specialRequests, 
      services = [], 
      totalAmount, 
      user 
    } = await req.json();

    // Log the incoming request body for debugging
    console.log('Booking request body:', { hallId, startDate, endDate, eventStartTime, eventType, guests, specialRequests, services, user });

    // Extract customer phone if provided
    const customerPhone = user?.phone || '';

    // Validate required fields
    if (!hallId || !startDate || !endDate || !eventStartTime || !eventType || !guests) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Fetch Hall
    const hall = await Hall.findById(hallId);

    if (!hall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    // Read platformFeePercent from hall document, default to 10 if missing
    const platformFeePercentage = hall.platformFeePercent ?? 10;

    // Check if dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }

    if (end < start) {
      return NextResponse.json(
        { error: 'End date must not be before start date' },
        { status: 400 }
      );
    }

    // Check availability
    const existingBooking = await Booking.findOne({
      hallId,
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start },
        },
      ],
      status: { $in: ['confirmed', 'waiting_owner_confirmation'] },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Hall is not available for the selected dates' },
        { status: 400 }
      );
    }

    // 2. Platform Fee Calculation
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const venueRental = hall.price * totalDays;
    
    // Calculate platform fee based on TOTAL venue rental
    const platformFee = Math.round((venueRental * platformFeePercentage) / 100);
    const totalPrice = venueRental + platformFee;

    // 3. Create booking with nested payment structure
    console.log('Creating booking with dates:', { startDate, endDate });
    const booking = await Booking.create({
      userId: session.user.id,
      hallId,
      customerPhone,
      eventType,
      guests,
      startDate,
      endDate,
      eventStartTime,
      specialRequests,
      venuePrice: venueRental,
      platformFee,
      platformFeePercentage,
      totalPrice,
      payment: {
        advancePaid: false,
        advanceAmount: 0,
        remainingBalance: totalPrice,
        paymentStatus: 'pending',
      },
      status: 'pending_advance',
      ownerId: hall.ownerId,
    });

    // Notify owner
    await Notification.create({
      userId: hall.ownerId,
      type: 'booking',
      message: `New booking for ${hall.name} for ${eventType} on ${startDate}`,
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
    let query: any = {};
    if (session.user.role === 'admin') {
      query = {};
    } else if (session.user.role === 'owner') {
      const ownerHalls = await Hall.find({ ownerId: session.user.id });
      const hallIds = ownerHalls.map(h => h._id);
      query = {
        $or: [
          { userId: session.user.id },
          { hallId: { $in: hallIds } }
        ]
      };
    } else {
      query = { userId: session.user.id };
    }

    bookings = await Booking.find(query)
      .populate('hallId', 'name images location amenities ownerId price')
      .sort({ createdAt: -1 })
      .lean();

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
 