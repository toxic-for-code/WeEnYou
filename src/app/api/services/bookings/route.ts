import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import ServiceBooking from '@/models/ServiceBooking';

export const dynamic = 'force-dynamic';

// GET /api/services/bookings - Get all bookings for provider's services
export async function GET() {
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


