import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';

export async function POST(req: Request) {
  try {
    const { bookingId, paymentType = 'advance' } = await req.json();
    
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }
    
    await connectDB();
    
    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    console.log('Test webhook - Before update:', {
      _id: booking._id,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      advancePaid: booking.advancePaid
    });
    
    // Simulate the webhook update
    if (paymentType === 'advance') {
      const updateResult = await Booking.findByIdAndUpdate(bookingId, {
        $set: {
          advancePaid: true,
          status: 'pending_owner_confirmation',
          paymentStatus: 'pending',
        }
      }, { new: true });
      
      console.log('Test webhook - Advance payment update result:', updateResult);
      
      // Verify the update
      const updatedBooking = await Booking.findById(bookingId);
      console.log('Test webhook - After update:', {
        _id: updatedBooking?._id,
        status: updatedBooking?.status,
        paymentStatus: updatedBooking?.paymentStatus,
        advancePaid: updatedBooking?.advancePaid
      });
      
      return NextResponse.json({
        message: 'Test webhook processed successfully',
        before: {
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          advancePaid: booking.advancePaid
        },
        after: {
          status: updatedBooking?.status,
          paymentStatus: updatedBooking?.paymentStatus,
          advancePaid: updatedBooking?.advancePaid
        }
      });
    }
    
    return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json({ error: 'Test webhook failed' }, { status: 500 });
  }
} 