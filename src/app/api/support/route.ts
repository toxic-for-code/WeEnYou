import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import SupportRequest from '@/models/SupportRequest';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const body = await request.json();
    const { subject, message } = body;
    if (!subject || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    // Save support request to DB
    const supportRequest = new SupportRequest({
      user: session.user.id,
      email: session.user.email,
      subject,
      message,
    });
    await supportRequest.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting support request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 