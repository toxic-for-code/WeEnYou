import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PlanEvent from '@/models/PlanEvent';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  await connectDB();
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ manager: null });
  // Find the latest event for this user
  const event = await PlanEvent.findOne({ userId }).sort({ createdAt: -1 }).lean();
  if (!event || !event.event_manager_id) return NextResponse.json({ manager: null });
  const manager = await User.findById(event.event_manager_id).lean();
  if (!manager) return NextResponse.json({ manager: null });
  return NextResponse.json({ manager: { name: manager.name, email: manager.email, phone: manager.phone } });
} 