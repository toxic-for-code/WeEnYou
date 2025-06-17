import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Service from '@/models/Service';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const [totalHalls, totalBookings, totalUsers, totalServices] = await Promise.all([
      Hall.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments(),
      Service.countDocuments(),
    ]);

    return NextResponse.json({
      totalHalls,
      totalBookings,
      totalUsers,
      totalServices,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 