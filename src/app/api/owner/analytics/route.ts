import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import Booking from '@/models/Booking';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();

    // Get all halls owned by this owner
    const halls = await Hall.find({ ownerId: session.user.id });
    const hallIds = halls.map(h => h._id);

    // Get all bookings for these halls
    const bookings = await Booking.find({ hallId: { $in: hallIds } });

    // Total bookings and revenue
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Bookings per month (last 12 months)
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }).reverse();
    const bookingsByMonth: Record<string, number> = {};
    months.forEach(m => (bookingsByMonth[m] = 0));
    bookings.forEach(b => {
      const d = new Date(b.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (bookingsByMonth[key] !== undefined) bookingsByMonth[key]++;
    });

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      bookingsByMonth,
    });
  } catch (error) {
    console.error('Owner analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
 