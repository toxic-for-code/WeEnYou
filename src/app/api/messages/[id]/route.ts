import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';

// DELETE: Delete a message
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const messageId = params.id;
    const message = await Message.findById(messageId);
    if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    if (message.from.toString() !== session.user.id && message.to.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    const conversation = await Conversation.findById(message.conversationId);
    await Message.deleteOne({ _id: messageId });
    // If this was the last message, update conversation's lastMessage
    if (conversation && conversation.lastMessage && conversation.lastMessage.toString() === messageId) {
      const lastMsg = await Message.findOne({ conversationId: conversation._id }).sort({ createdAt: -1 });
      conversation.lastMessage = lastMsg ? lastMsg._id : null;
      conversation.lastMessageAt = lastMsg ? lastMsg.createdAt : null;
      await conversation.save();
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 