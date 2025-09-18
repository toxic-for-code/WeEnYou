import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Service from '@/models/Service';
import ServiceBooking from '@/models/ServiceBooking';

export const dynamic = 'force-dynamic';

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
// NOTE: Additional endpoints live in /api/services/book (POST) and
// /api/services/bookings (GET).
 