import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Service from '@/models/Service';
import ServiceBooking from '@/models/ServiceBooking';

export const dynamic = 'force-dynamic';

// POST /api/services/book - Book a service
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


