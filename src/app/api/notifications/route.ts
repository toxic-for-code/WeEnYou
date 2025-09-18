import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';

// GET: Fetch notifications for logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const notifications = await Notification.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a notification
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const { userId, type, message } = await req.json();
    if (!userId || !type || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const notification = await Notification.create({ userId, type, message });
    return NextResponse.json({ notification });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Mark notification as read
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const { notificationId } = await req.json();
    if (!notificationId) return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
    await Notification.findByIdAndUpdate(notificationId, { read: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
 