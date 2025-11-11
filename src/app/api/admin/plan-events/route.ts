import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { connectDB } from '@/lib/db';
import PlanEvent from '@/models/PlanEvent';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    // Populate user info if available (if you store userId in PlanEvent, otherwise skip)
    const events = await PlanEvent.find().lean();
    // Optionally, add userName if you have userId in PlanEvent
    // If not, just return events
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}