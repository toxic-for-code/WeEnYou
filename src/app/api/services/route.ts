import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Service from '@/models/Service';
import ServiceBooking from '@/models/ServiceBooking';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'provider') {
      return NextResponse.json({ error: 'Only providers can list services.' }, { status: 403 });
    }
    await connectDB();
    const body = await req.json();
    const { serviceType, name, description, price, contact, city, state } = body;
    if (!serviceType || !name || !description || !price || !contact || !city || !state) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    const service = await Service.create({
      serviceType, name, description, price, contact, city, state, providerId: session.user.id
    });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const providerId = searchParams.get('providerId');
    
    let query: any = {};
    if (city) query.city = city;
    if (providerId) query.providerId = providerId;
    
    const services = await Service.find(query)
      .select('+verified')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ services }, { status: 200 });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services.' }, { status: 500 });
  }
}

// POST /api/services/book - Book a service
export async function POST_BOOK(req: Request) {
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

// GET /api/services/bookings - Get all bookings for provider's services
export async function GET_BOOKINGS(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'provider') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const bookings = await ServiceBooking.find({ providerId: session.user.id })
      .populate('userId', 'name email phone')
      .populate('serviceId', 'name serviceType')
      .populate('hallId', 'name location ownerId')
      .populate({
        path: 'hallId',
        populate: { path: 'ownerId', select: 'name email phone' }
      })
      .sort({ createdAt: -1 });
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching service bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch service bookings.' }, { status: 500 });
  }
} 
 