import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import BookingPayment from '@/models/BookingPayment';
import Booking from '@/models/Booking';
import Notification from '@/models/Notification';
import { verifySignature } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { bookingId, bookingPaymentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as {
      bookingId?: string;
      bookingPaymentId: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };
    if (!bookingPaymentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const valid = verifySignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature });
    if (!valid) {
      return NextResponse.json({ error: 'Signature verification failed.' }, { status: 400 });
    }

    // Update BookingPayment record
    const bp = await BookingPayment.findById(bookingPaymentId);
    if (!bp) return NextResponse.json({ error: 'Payment record not found.' }, { status: 404 });

    bp.remainingPaymentStatus = 'paid';
    bp.status = 'completed';
    await bp.save();

    // Update the main Booking document
    const linkedBookingId = bookingId || (bp as any).bookingId;
    if (linkedBookingId) {
      const booking = await Booking.findById(linkedBookingId).populate('hallId') as any;
      if (booking) {
        booking.paymentStatus = 'paid';
        booking.finalPaymentStatus = 'paid';
        booking.status = 'completed';
        booking.remainingBalance = 0;
        await booking.save();

        // Notify user
        await Notification.create({
          userId: booking.userId,
          type: 'booking',
          message: `Your booking for '${booking.hallId?.name || 'the hall'}' is now fully paid and confirmed. See you at the event!`,
        });
      }
    }

    return NextResponse.json({
      message: 'Remaining amount paid. Booking Completed.',
      bookingPaymentId: (bp._id as any).toString(),
    });
  } catch (e: any) {
    console.error('verify-remaining-payment error', e);
    return NextResponse.json({ error: 'Failed to verify remaining payment.' }, { status: 500 });
  }
}