import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import PlanEvent from '@/models/PlanEvent';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'event_manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const events = await PlanEvent.find({ event_manager_id: session.user.id }).lean();
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 