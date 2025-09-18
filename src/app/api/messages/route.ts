import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';
import Notification from '@/models/Notification';

export const dynamic = 'force-dynamic';

// GET: Fetch messages for a conversation
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get('serviceId');
    const bookingId = searchParams.get('bookingId');
    const providerId = searchParams.get('providerId');
    
    // If serviceId and bookingId are provided, get messages for that service booking
    if (serviceId && bookingId) {
      const messages = await Message.find({
        serviceId,
        bookingId,
        $or: [
          { from: session.user.id },
          { to: session.user.id },
        ],
      })
      .populate([
        { path: 'from', select: 'name' },
        { path: 'to', select: 'name' }
      ])
      .sort({ createdAt: 1 });

      console.log('Fetched messages:', messages);
      return NextResponse.json({ messages });
    }
    
    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Send a message
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error('Authentication failed:', { session });
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    await connectDB();
    const body = await req.json();
    console.log('Received message request:', body);
    
    const { providerId, serviceId, hallId, bookingId, content } = body;
    
    // Log all required fields
    console.log('Required fields:', {
      providerId,
      serviceId,
      bookingId,
      content,
      fromUserId: session.user.id
    });
    
    if (!providerId || !serviceId || !bookingId || !content) {
      console.error('Missing required fields:', { providerId, serviceId, bookingId, content });
      return NextResponse.json({ 
        error: 'Missing required fields',
        missing: {
          providerId: !providerId,
          serviceId: !serviceId,
          bookingId: !bookingId,
          content: !content
        }
      }, { status: 400 });
    }
    
    const message = await Message.create({
      from: session.user.id,
      to: providerId,
      serviceId,
      hallId,
      bookingId,
      content,
      read: false,
    });

    // Populate the message with sender and receiver info
    const populatedMessage = await message.populate([
      { path: 'from', select: 'name' },
      { path: 'to', select: 'name' }
    ]);
    
    console.log('Message created:', populatedMessage);
    
    // Create notification for the recipient
    const notification = await Notification.create({
      userId: providerId,
      type: 'other',
      message: 'You have a new message from a customer.',
      relatedId: bookingId,
    });
    
    console.log('Notification created:', notification);
    
    return NextResponse.json({ message: populatedMessage });
  } catch (error) {
    console.error('Detailed error in POST /api/messages:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
 