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
    const {
      bookingId,
      userId,
      hallId,
      totalAmount,
      advanceAmount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body as {
      bookingId?: string;
      userId: string; hallId: string; totalAmount: number; advanceAmount: number;
      razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
    };

    if (!userId || !hallId || !totalAmount || !advanceAmount || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // Verify Razorpay signature
    const valid = verifySignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature });
    if (!valid) {
      return NextResponse.json({ error: 'Signature verification failed.' }, { status: 400 });
    }

    const remainingAmount = Math.max(0, totalAmount - advanceAmount);

    // Create BookingPayment record
    const bookingPayment = await BookingPayment.create({
      userId,
      hallId,
      totalAmount,
      advanceAmountRequested: advanceAmount,
      advanceAmountPaid: advanceAmount,
      advanceOrderId: razorpay_order_id,
      advancePaymentId: razorpay_payment_id,
      advancePaymentStatus: 'paid',
      remainingAmount,
      status: 'request_sent',
    });

    // Also update the main Booking document if bookingId is provided
    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.payment = {
          advancePaid: true,
          advanceAmount: advanceAmount,
          remainingBalance: remainingAmount,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          paymentStatus: 'paid',
          paymentTimestamp: new Date(),
        };
        booking.status = 'waiting_owner_confirmation' as any;
        booking.bookingPaymentId = (bookingPayment._id as any);
        await booking.save();

        // Notify the hall owner
        const populatedBooking = await Booking.findById(bookingId).populate('hallId') as any;
        if (populatedBooking?.hallId?.ownerId) {
          await Notification.create({
            userId: populatedBooking.hallId.ownerId,
            type: 'booking',
            message: `A user has paid the advance for booking at '${populatedBooking.hallId.name}'. Please approve or reject the booking.`,
          });
        }
      }
    }

    return NextResponse.json({
      message: 'Booking Request Sent!\nThank you for your payment.\nPlease wait for the owner to accept your request.\nYou\'ll be notified once it\'s accepted.',
      bookingId: bookingId || (bookingPayment._id as any).toString(),
      bookingPaymentId: (bookingPayment._id as any).toString(),
    });
  } catch (e: any) {
    console.error('verify-advance-payment error', e);
    return NextResponse.json({ error: 'Failed to verify advance payment.' }, { status: 500 });
  }
}