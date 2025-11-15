import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import BookingPayment from '@/models/BookingPayment';
import Booking from '@/models/Booking';
import { verifySignature, razorpay } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as {
      bookingId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string;
    };
    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    let valid = verifySignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature });
    if (!valid) {
      // Fallback: validate via Razorpay API when signature mismatches
      console.warn('Remaining payment verify: signature mismatch. Attempting API validation fallback.', {
        bookingId,
        razorpay_order_id,
        razorpay_payment_id,
      });
      try {
        const payment = await (razorpay as any).payments.fetch(razorpay_payment_id);
        const order = await (razorpay as any).orders.fetch(razorpay_order_id);
        const paymentOk = payment && payment.order_id === razorpay_order_id && (payment.status === 'captured' || payment.status === 'authorized');
        const notes = order?.notes || {};
        const orderOk = order && notes && notes.type === 'remaining' && notes.bookingId === bookingId;
        if (!paymentOk || !orderOk) {
          console.error('Remaining payment verify fallback failed', {
            paymentStatus: payment?.status,
            paymentOrderId: payment?.order_id,
            orderNotes: notes,
          });
          return NextResponse.json({ error: 'Payment validation failed.' }, { status: 400 });
        }
        valid = true;
      } catch (apiErr) {
        console.error('Error during Razorpay API validation for remaining payment', apiErr);
        return NextResponse.json({ error: 'Failed to validate payment with Razorpay.' }, { status: 500 });
      }
    }

    const bookingPayment = await BookingPayment.findById(bookingId);
    if (!bookingPayment) return NextResponse.json({ error: 'BookingPayment not found.' }, { status: 404 });

    // Get the actual Booking ID from the order notes
    let actualBookingId: string | null = null;
    try {
      const order = await (razorpay as any).orders.fetch(razorpay_order_id);
      actualBookingId = order?.notes?.bookingId || null;
      console.log('Fetched order notes:', { 
        actualBookingId, 
        orderNotes: order?.notes,
        orderId: razorpay_order_id 
      });
      
      if (!actualBookingId) {
        console.warn('BookingId not found in order notes, will use fallback lookup');
      }
    } catch (err) {
      console.error('Could not fetch order to get bookingId from notes', err);
    }

    // Update BookingPayment
    bookingPayment.remainingPaymentStatus = 'paid';
    bookingPayment.status = 'completed';
    await bookingPayment.save();
    console.log('Updated BookingPayment:', {
      bookingPaymentId: bookingPayment._id.toString(),
      remainingPaymentStatus: bookingPayment.remainingPaymentStatus,
      status: bookingPayment.status,
    });

    // Also update the Booking document
    let booking = null;
    if (actualBookingId) {
      booking = await Booking.findById(actualBookingId);
      console.log('Found booking by ID:', { bookingId: actualBookingId, found: !!booking });
    }
    
    // Fallback: find by userId and hallId if not found by ID
    // Try multiple queries with different criteria
    if (!booking) {
      // First try: find by userId, hallId, and status (most specific)
      // Note: 'approved' is not a valid enum, but we check for it in case it exists in DB
      booking = await Booking.findOne({ 
        userId: bookingPayment.userId, 
        hallId: bookingPayment.hallId,
        status: { $in: ['confirmed', 'pending_owner_confirmation', 'pending_approval'] }
      })
        .sort({ createdAt: -1 });
      
      console.log('Found booking by userId/hallId/status:', { 
        userId: bookingPayment.userId.toString(), 
        hallId: bookingPayment.hallId.toString(),
        found: !!booking 
      });
    }
    
    // Second fallback: find by userId and hallId only (less restrictive)
    if (!booking) {
      booking = await Booking.findOne({ 
        userId: bookingPayment.userId, 
        hallId: bookingPayment.hallId
      })
        .sort({ createdAt: -1 });
      
      console.log('Found booking by userId/hallId (fallback):', { 
        userId: bookingPayment.userId.toString(), 
        hallId: bookingPayment.hallId.toString(),
        found: !!booking 
      });
    }
    
    if (booking) {
      // Store old values for logging
      const oldValues = {
        status: booking.status,
        finalPaymentStatus: booking.finalPaymentStatus,
        finalPaymentMethod: booking.finalPaymentMethod,
        remainingAmount: booking.remainingAmount,
        paymentStatus: booking.paymentStatus,
      };
      
      // Fix invalid status if it exists (e.g., 'approved' should be 'confirmed')
      if (booking.status === 'approved') {
        console.warn('Fixing invalid booking status from "approved" to "confirmed"');
        booking.status = 'confirmed';
      }
      
      // Update booking fields
      booking.finalPaymentStatus = 'paid';
      booking.finalPaymentMethod = 'online';
      booking.remainingAmount = 0;
      booking.paymentStatus = 'paid';
      
      // Save the booking
      const savedBooking = await booking.save();
      
      console.log('Updated Booking document:', {
        bookingId: savedBooking._id.toString(),
        oldValues,
        newValues: {
          finalPaymentStatus: savedBooking.finalPaymentStatus,
          finalPaymentMethod: savedBooking.finalPaymentMethod,
          remainingAmount: savedBooking.remainingAmount,
          paymentStatus: savedBooking.paymentStatus,
        },
      });
    } else {
      console.error('Booking not found for remaining payment verification', {
        bookingPaymentId: bookingPayment._id.toString(),
        actualBookingId,
        userId: bookingPayment.userId.toString(),
        hallId: bookingPayment.hallId.toString(),
        orderNotes: actualBookingId ? 'Found in notes' : 'Not found in notes',
      });
      
      // Return error if booking not found
      return NextResponse.json({ 
        error: 'Booking not found. Payment verified but booking update failed.',
        warning: 'Please contact support to update booking manually.',
        bookingPaymentId: bookingPayment._id.toString()
      }, { status: 200 }); // Return 200 because payment was successful, just booking update failed
    }

    return NextResponse.json({ 
      message: 'Remaining amount paid. Booking Completed.', 
      bookingId: bookingPayment._id.toString(),
      bookingDocumentId: booking?._id.toString()
    });
  } catch (e: any) {
    console.error('verify-remaining-payment error', e);
    return NextResponse.json({ error: 'Failed to verify remaining payment.' }, { status: 500 });
  }
}