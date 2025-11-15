import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import ServiceBooking from '@/models/ServiceBooking';
import Razorpay from 'razorpay';

export const dynamic = 'force-dynamic';

// Validate environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay environment variables are not configured');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { bookingId, serviceBookingIds, amount, type } = await req.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: session.user.id,
    }).populate('hallId') as any;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Booking is already paid' },
        { status: 400 }
      );
    }

    // Verify service bookings if any
    if (serviceBookingIds && serviceBookingIds.length > 0) {
      const serviceBookings = await ServiceBooking.find({
        _id: { $in: serviceBookingIds },
        userId: session.user.id,
        paymentStatus: 'pending'
      });

      if (serviceBookings.length !== serviceBookingIds.length) {
        return NextResponse.json(
          { error: 'One or more service bookings are invalid or already paid' },
          { status: 400 }
        );
      }
    }

    // Enforce minimum advance amount for advance payment
    if (type === 'advance') {
      const minAdvance = Math.min(50000, booking.totalPrice * 0.5);
      if (amount < minAdvance) {
        return NextResponse.json({ error: `Advance must be at least ₹${minAdvance}` }, { status: 400 });
      }
      if (amount > booking.totalPrice) {
        return NextResponse.json({ error: `Advance cannot be greater than total booking amount (₹${booking.totalPrice})` }, { status: 400 });
      }
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId: bookingId,
        serviceBookingIds: serviceBookingIds ? JSON.stringify(serviceBookingIds) : '',
        userId: session.user.id,
        hall: booking.hallId.name,
        type: type, // Add payment type to distinguish advance vs final
      },
    });

    // Save the Razorpay orderId in the booking for webhook lookup
    const updateResult = await Booking.findByIdAndUpdate(bookingId, { $set: { orderId: order.id } }, { new: true });
    console.log('Updated booking with orderId:', { bookingId, orderId: order.id, updatedStatus: updateResult?.status, updatedAdvancePaid: updateResult?.advancePaid });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
 