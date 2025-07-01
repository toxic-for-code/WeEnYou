import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import Booking from '@/models/Booking';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all halls (since this is an admin endpoint)
    const halls = await Hall.find()
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    // Get booking statistics for each hall
    const hallsWithStats = await Promise.all(
      halls.map(async (hall) => {
        const bookings = await Booking.find({ hallId: hall._id });
        const now = new Date();

        const stats = {
          bookings: {
            total: bookings.length,
            upcoming: bookings.filter(
              (b) =>
                b.status === 'confirmed' &&
                new Date(b.startDate) > now
            ).length,
            completed: bookings.filter(
              (b) => b.status === 'completed'
            ).length,
            cancelled: bookings.filter(
              (b) => b.status === 'cancelled'
            ).length,
          },
          revenue: {
            total: bookings
              .filter((b) => b.paymentStatus === 'paid')
              .reduce((sum, b) => sum + b.totalPrice, 0),
            thisMonth: bookings
              .filter(
                (b) =>
                  b.paymentStatus === 'paid' &&
                  new Date(b.createdAt).getMonth() === now.getMonth() &&
                  new Date(b.createdAt).getFullYear() === now.getFullYear()
              )
              .reduce((sum, b) => sum + b.totalPrice, 0),
            lastMonth: bookings
              .filter(
                (b) =>
                  b.paymentStatus === 'paid' &&
                  new Date(b.createdAt).getMonth() ===
                    (now.getMonth() === 0 ? 11 : now.getMonth() - 1) &&
                  new Date(b.createdAt).getFullYear() ===
                    (now.getMonth() === 0
                      ? now.getFullYear() - 1
                      : now.getFullYear())
              )
              .reduce((sum, b) => sum + b.totalPrice, 0),
          },
        };

        return {
          ...hall.toObject(),
          bookings: stats.bookings,
          revenue: stats.revenue,
        };
      })
    );

    return NextResponse.json({ halls: hallsWithStats });
  } catch (error) {
    console.error('Error fetching halls:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
 