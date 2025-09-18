import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import Booking from '@/models/Booking';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const hallId = searchParams.get('hallId');

    await connectDB();

    let query: any = {};
    if (session.user.role !== 'admin') {
      // Only restrict to user's halls if not admin
      const userHalls = await Hall.find({ ownerId: session.user.id });
      const hallIds = userHalls.map((hall) => hall._id);
      query.hallId = { $in: hallIds };
    }
    if (status) {
      query.status = status;
    }
    if (hallId) {
      query.hallId = hallId;
    }

    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('hallId', 'name images location')
      .populate('userId', 'name email phone');

    // Get total count for pagination
    const total = await Booking.countDocuments(query);

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
 