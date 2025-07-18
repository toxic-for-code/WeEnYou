import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import PlanEvent from '@/models/PlanEvent';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ events: [] });
  }
  // Find all planned events for this user
  const events = await PlanEvent.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
  // Fetch manager names for assigned events
  const managerIds = events.map(ev => ev.event_manager_id).filter(Boolean);
  let managers = {};
  if (managerIds.length > 0) {
    const managerDocs = await User.find({ _id: { $in: managerIds } }).lean();
    managers = Object.fromEntries(managerDocs.map(m => [m._id.toString(), m.name]));
  }
  // Attach manager name to each event
  const eventsWithManager = events.map(ev => ({
    ...ev,
    eventManagerName: ev.event_manager_id ? managers[ev.event_manager_id.toString()] : null,
  }));
  return NextResponse.json({ events: eventsWithManager });
} 