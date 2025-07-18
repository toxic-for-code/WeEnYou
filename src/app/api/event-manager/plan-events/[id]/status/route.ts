import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import PlanEvent from '@/models/PlanEvent';

export async function PUT(req: NextRequest, context) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'event_manager') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = context.params;
  try {
    const { status } = await req.json();
    // Only allow update if event_manager_id matches
    const event = await PlanEvent.findOneAndUpdate(
      { _id: id, event_manager_id: session.user.id },
      { status },
      { new: true }
    );
    if (!event) {
      return NextResponse.json({ error: 'Event not found or not assigned to you.' }, { status: 404 });
    }
    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 