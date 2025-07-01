import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ChatRoom from '@/models/ChatRoom';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { booking_id, user_id, owner_id, provider_id } = await req.json();
    if (!booking_id || !user_id || !owner_id || !provider_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    let room = await ChatRoom.findOne({ booking_id });
    if (!room) {
      room = await ChatRoom.create({ booking_id, user_id, owner_id, provider_id });
    }
    return NextResponse.json({ room });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 