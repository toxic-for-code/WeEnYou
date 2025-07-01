import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Service from '@/models/Service';
import ServiceBooking from '@/models/ServiceBooking';

// GET /api/service-bookings - Get service bookings
// Can be filtered by hallBookingId or get all bookings for a provider
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    await connectDB();
    const { searchParams } = new URL(req.url);
    const hallBookingId = searchParams.get('hallBookingId');
    
    // If hallBookingId is provided, get bookings for that specific hall booking
    if (hallBookingId) {
      const bookings = await ServiceBooking.find({ hallBookingId })
        .populate({
          path: 'serviceId',
          select: 'name serviceType price providerId',
          populate: {
            path: 'providerId',
            select: 'name _id'
          }
        })
        .sort({ createdAt: -1 });
      
      return NextResponse.json({ bookings });
    }
    
    // If no hallBookingId and user is a provider, get all their service bookings
    if (session.user.role === 'provider') {
      const bookings = await ServiceBooking.find({ providerId: session.user.id })
        .populate('userId', 'name email phone')
        .populate('serviceId', 'name serviceType')
        .populate('hallId', 'name location ownerId')
        .populate({
          path: 'hallId',
          populate: { path: 'ownerId', select: 'name email phone' }
        })
        .sort({ createdAt: -1 });
      
      return NextResponse.json({ bookings });
    }

    // If neither condition is met, return error
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching service bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch service bookings.' }, { status: 500 });
  }
}

// POST /api/service-bookings - Book a service
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    await connectDB();
    const { serviceId, hallId, hallBookingId, startDate, endDate, totalPrice, specialRequests } = await req.json();
    if (!serviceId || !startDate || !endDate || !totalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    const booking = await ServiceBooking.create({
      userId: session.user.id,
      serviceId,
      providerId: service.providerId,
      hallId,
      hallBookingId,
      startDate,
      endDate,
      totalPrice,
      specialRequests,
      status: 'pending',
      paymentStatus: 'pending',
    });
    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Error booking service:', error);
    return NextResponse.json({ error: 'Failed to book service.' }, { status: 500 });
  }
} 
 