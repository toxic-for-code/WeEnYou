import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Conversation from '@/models/Conversation';
// import Message from '@/models/Message'; // DELETED - legacy model
import Notification from '@/models/Notification';

// DEPRECATED: This endpoint is no longer functional due to removal of Message model and migration to group chat system.

// GET: Fetch messages for a conversation (paginated)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const conversationId = params.id;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;
    // Fetch all messages for the conversation
    // const messages = await Message.find({ conversationId })
    //   .populate('from', 'name role')
    //   .sort({ createdAt: 1 })
    //   .skip(skip)
    //   .limit(limit);
    const total = 0;
    return NextResponse.json({ messages: [], total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Send a new message in a conversation
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const conversationId = params.id;
    const body = await req.json();
    const { content, attachments } = body;
    if (!content) return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    // const conversation = await Conversation.findById(conversationId);
    // if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    // Deprecated endpoint: no message creation.
    // const message = await Message.create({
    //   from: session.user.id,
    //   conversationId,
    //   conversationType: conversation.conversationType,
    //   hallId: conversation.hallId,
    //   serviceId: conversation.serviceId,
    //   bookingId: conversation.bookingId,
    //   content,
    //   attachments,
    //   read: false,
    //   delivered: true,
    // });
    // Update conversation last message
    // conversation.lastMessage = null;
    // conversation.lastMessageAt = new Date();
    // await conversation.save();
    // Create notification for all other participants
    // const notifyIds = conversation.participants.filter((id: any) => id.toString() !== session.user.id);
    // for (const notifyId of notifyIds) {
    //   await Notification.create({
    //     userId: notifyId,
    //     type: 'other',
    //     message: 'You have a new message.',
    //     conversationId,
    //     messageId: null,
    //   });
    // }
    // const populatedMessage = await message.populate('from', 'name role');
    // Emit real-time event
    if (global._io) {
      // global._io.to(conversationId).emit('new_message', { message: populatedMessage });
    }
    return NextResponse.json({ message: null });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 