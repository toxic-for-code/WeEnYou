import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';

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

    // Get only pending halls that need approval
    // This will fetch pending halls from both main site and owner subdomain
    const pendingHalls = await Hall.find({ status: 'pending' })
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    return NextResponse.json({ 
      halls: pendingHalls,
      count: pendingHalls.length 
    });
  } catch (error) {
    console.error('Error fetching pending halls:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 