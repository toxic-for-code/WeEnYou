import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import Hall from '@/models/Hall';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import { HallDoc } from '@/models/Hall';
import { UserDoc } from '@/models/User';

export async function POST() {
  try {
    await connectDB();
    const now = new Date();
    const soon = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 25 hours from now
    const later = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Find bookings starting in 24-25h, not yet reminded
    const bookings = await Booking.find({
      reminderSent: false,
      status: { $in: ['confirmed'] },
      startDate: { $gte: later, $lt: soon },
    }).populate('hallId').populate('userId') as any[];

    let remindersSent = 0;
    for (const booking of bookings) {
      // Send to user
      if (booking.userId && (booking.userId as UserDoc).email) {
        await sendEmail({
          to: (booking.userId as UserDoc).email,
          subject: `Reminder: Your booking at ${(booking.hallId as HallDoc).name} is tomorrow!`,
          html: `<p>Dear ${(booking.userId as UserDoc).name || 'User'},</p><p>This is a reminder that your booking at <b>${(booking.hallId as HallDoc).name}</b> starts on <b>${new Date(booking.startDate).toLocaleString()}</b>.</p><p>Location: ${(booking.hallId as HallDoc).location.address || ''}, ${(booking.hallId as HallDoc).location.city}, ${(booking.hallId as HallDoc).location.state}</p><p>Thank you for using our platform!</p>`,
        });
      }
      // Send to owner
      if ((booking.hallId as HallDoc).ownerId) {
        const owner = await User.findById((booking.hallId as HallDoc).ownerId);
        if (owner && owner.email) {
          await sendEmail({
            to: owner.email,
            subject: `Reminder: Booking at your hall '${(booking.hallId as HallDoc).name}' is tomorrow!`,
            html: `<p>Dear ${owner.name || 'Owner'},</p><p>This is a reminder that a booking at your hall '<b>${(booking.hallId as HallDoc).name}</b>' starts on <b>${new Date(booking.startDate).toLocaleString()}</b>.</p><p>Customer: ${(booking.userId as UserDoc).name || ''} (${(booking.userId as UserDoc).email})</p><p>Thank you for using our platform!</p>`,
          });
        }
      }
      booking.reminderSent = true;
      await booking.save();
      remindersSent++;
    }
    return NextResponse.json({ remindersSent });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
 