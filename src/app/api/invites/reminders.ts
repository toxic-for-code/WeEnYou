import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import RSVP from '@/models/RSVP';
import { sendEmail } from '@/lib/email';

export async function POST() {
  try {
    await connectDB();
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const oneDay23HoursFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000) + (60 * 60 * 1000)); // 2 days + 1 hour

    // Find RSVPs for events in ~2 days, not yet reminded
    const rsvps = await RSVP.find({
      eventDate: { $gte: twoDaysFromNow, $lt: oneDay23HoursFromNow },
      reminderSent: false,
      response: 'Yes',
    });

    let remindersSent = 0;
    for (const rsvp of rsvps) {
      await sendEmail({
        to: rsvp.guestEmail,
        subject: 'Event Reminder: Your upcoming event',
        html: `<p>Dear Guest,</p><p>This is a reminder for your upcoming event on <b>${rsvp.eventDate ? new Date(rsvp.eventDate).toLocaleString() : ''}</b>.</p><p>We look forward to seeing you!</p>`,
      });
      rsvp.reminderSent = true;
      await rsvp.save();
      remindersSent++;
    }
    return NextResponse.json({ remindersSent });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 