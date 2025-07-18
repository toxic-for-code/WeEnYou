import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import PlanEvent from '@/models/PlanEvent';
import { sendEmail } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  console.log('PlanEvent API route called');
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await req.json();
    // Attach user info from session if not present
    if (!data.userId) data.userId = session.user.id;
    if (!data.userName) data.userName = session.user.name;
    if (!data.userEmail) data.userEmail = session.user.email;
    if (!data.userPhone && (session.user as any)?.phone) data.userPhone = (session.user as any).phone;
    console.log('Saving PlanEvent with userId:', data.userId, 'session:', session);
    const saved = await new PlanEvent(data).save();

    // Try to send email notification, but don't fail if it errors
    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@weenyou.com',
        subject: 'New Event Planning Submission',
        html: `
          <h2>New Event Planning Submission</h2>
          <ul>
            <li><b>Event Type:</b> ${data.eventType}</li>
            <li><b>City:</b> ${data.city}</li>
            <li><b>Date:</b> ${data.date}</li>
            <li><b>Guests:</b> ${data.guests}</li>
            <li><b>Budget:</b> ${data.budget}</li>
            <li><b>Venue Type:</b> ${data.venueType}</li>
            <li><b>Services:</b> ${data.services?.join(', ')}</li>
            <li><b>Theme:</b> ${data.theme}</li>
            <li><b>Special:</b> ${data.special}</li>
            <li><b>Preferred Contact Time:</b> ${data.contactTime}</li>
            <li><b>Event Tag:</b> ${data.eventTag}</li>
            <li><b>User Name:</b> ${data.userName}</li>
            <li><b>User Email:</b> ${data.userEmail}</li>
            <li><b>User Phone:</b> ${data.userPhone}</li>
          </ul>
          <p>Submitted at: ${new Date(saved.createdAt).toLocaleString()}</p>
        `,
      });
    } catch (emailErr) {
      console.error('Plan event email error:', emailErr);
      // Do not throw, just log
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Plan event submission error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 