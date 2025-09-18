import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';

export const dynamic = 'force-dynamic';

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

    // Get recent pending halls (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPendingHalls = await Hall.find({
      status: 'pending',
      createdAt: { $gte: sevenDaysAgo }
    })
    .populate('ownerId', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get total pending count
    const totalPending = await Hall.countDocuments({ status: 'pending' });

    return NextResponse.json({
      recentPendingHalls,
      totalPending,
      hasNewSubmissions: recentPendingHalls.length > 0
    });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 