import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';

export async function GET() {
  try {
    await connectDB();
    
    // Get a sample booking to check the database structure
    const sampleBooking = await Booking.findOne().populate('hallId', 'name');
    
    return NextResponse.json({
      message: 'Test endpoint working',
      sampleBooking: sampleBooking ? {
        _id: sampleBooking._id,
        status: sampleBooking.status,
        paymentStatus: sampleBooking.paymentStatus,
        advancePaid: sampleBooking.advancePaid,
        hallName: sampleBooking.hallId?.name,
        createdAt: sampleBooking.createdAt
      } : null,
      totalBookings: await Booking.countDocuments(),
      pendingAdvanceBookings: await Booking.countDocuments({ status: 'pending_advance' }),
      pendingOwnerConfirmationBookings: await Booking.countDocuments({ status: 'pending_owner_confirmation' }),
      advancePaidBookings: await Booking.countDocuments({ advancePaid: true })
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ error: 'Test failed' }, { status: 500 });
  }
} 