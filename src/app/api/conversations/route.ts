import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

// GET: List all conversations for the authenticated user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const conversations = await Conversation.find({
      participants: session.user.id
    })
      .populate('participants', 'name role')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new conversation
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const body = await req.json();
    let { participants, conversationType, hallId, serviceId, bookingId } = body;
    if (!participants || !conversationType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Deduplicate and sort participants for group chat
    participants = Array.from(new Set(participants.map(String))).sort();
    // Prevent duplicate conversations
    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: participants.length },
      conversationType,
      hallId,
      serviceId,
      bookingId
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants,
        conversationType,
        hallId,
        serviceId,
        bookingId
      });
    }
    return NextResponse.json({ conversation });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 