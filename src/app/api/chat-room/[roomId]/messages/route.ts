import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ChatMessage from '@/models/ChatMessage';

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
  try {
    await connectDB();
    const { roomId } = params;
    const messages = await ChatMessage.find({ chat_room_id: roomId }).sort({ timestamp: 1 });
    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  try {
    await connectDB();
    const { roomId } = params;
    const { sender_id, sender_role, content } = await req.json();
    if (!sender_id || !sender_role || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const message = await ChatMessage.create({
      chat_room_id: roomId,
      sender_id,
      sender_role,
      content,
      timestamp: new Date(),
      read_by: [sender_id]
    });
    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 