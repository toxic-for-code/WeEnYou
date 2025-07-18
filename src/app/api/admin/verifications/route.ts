import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Verification from '@/models/Verification';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/admin/verifications?status=pending|approved|rejected
export async function GET(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const filter: any = {};
  if (status) filter.status = status;
  const verifications = await Verification.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(verifications);
} 