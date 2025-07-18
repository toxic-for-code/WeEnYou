import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import SupportRequest from '@/models/SupportRequest';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const requests = await SupportRequest.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name email');
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching support requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 