import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Hall from '@/models/Hall';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get timeframe from query params
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date();
    switch (timeframe) {
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default: // month
        startDate.setMonth(now.getMonth() - 1);
    }

    // Get total counts
    const [totalBookings, totalUsers, totalHalls] = await Promise.all([
      Booking.countDocuments(),
      User.countDocuments(),
      Hall.countDocuments(),
    ]);

    // Get total revenue
    const bookings = await Booking.find({
      createdAt: { $gte: startDate },
      status: { $in: ['confirmed', 'completed'] },
      paymentStatus: 'paid'
    });
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Get revenue by month
    const revenueByMonth = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['confirmed', 'completed'] },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get bookings by status
    const bookingsByStatus = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get user growth by month
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get popular halls
    const popularHalls = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $group: {
          _id: '$hallId',
          bookingsCount: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { bookingsCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'halls',
          localField: '_id',
          foreignField: '_id',
          as: 'hallDetails'
        }
      },
      {
        $unwind: '$hallDetails'
      },
      {
        $project: {
          _id: 1,
          name: '$hallDetails.name',
          bookingsCount: 1,
          revenue: 1
        }
      }
    ]);

    // Format the data
    const formatMonth = (date: { year: number; month: number }) => {
      return new Date(date.year, date.month - 1).toLocaleString('default', { month: 'short' });
    };

    return NextResponse.json({
      totalRevenue,
      totalBookings,
      totalUsers,
      totalHalls,
      revenueByMonth: revenueByMonth.map(item => ({
        month: formatMonth(item._id),
        revenue: item.revenue
      })),
      bookingsByStatus: bookingsByStatus.map(item => ({
        status: item._id,
        count: item.count
      })),
      userGrowth: userGrowth.map(item => ({
        month: formatMonth(item._id),
        count: item.count
      })),
      popularHalls
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
 