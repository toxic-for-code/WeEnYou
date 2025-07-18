import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import RSVP from '@/models/RSVP';

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const { inviteId, guestEmail, response, guestCount, specialRequests, eventDate } = await req.json();
    if (!inviteId || !guestEmail || !response) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    await RSVP.create({ inviteId, guestEmail, response, guestCount, specialRequests, eventDate });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit RSVP', details: error?.toString() }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const inviteId = req.nextUrl.searchParams.get('inviteId');
    if (!inviteId) {
      return NextResponse.json({ error: 'Missing inviteId' }, { status: 400 });
    }
    const rsvps = await RSVP.find({ inviteId }).sort({ respondedAt: -1 });
    return NextResponse.json({ rsvps });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch RSVPs', details: error?.toString() }, { status: 500 });
  }
} 