import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PlanEvent from '@/models/PlanEvent';
import User from '@/models/User';

export async function POST(req: NextRequest, context) {
  const { params } = context;
  await connectDB();
  try {
    const { event_manager_id } = await req.json();
    const id = params.id;
    // Check if the user is an event_manager
    const user = await User.findById(event_manager_id).exec();
    if (!user || user.role !== 'event_manager') {
      return NextResponse.json({ success: false, error: 'Selected user is not an event manager.' }, { status: 400 });
    }
    const updated = await PlanEvent.findByIdAndUpdate(
      id,
      { event_manager_id },
      { new: true }
    ).exec();
    return NextResponse.json({ success: true, event: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 