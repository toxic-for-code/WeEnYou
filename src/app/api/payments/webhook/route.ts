import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import ServiceBooking from '@/models/ServiceBooking';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    await connectDB();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { bookingId, serviceBookingIds } = session.metadata!;

        // Update hall booking status
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'paid',
          status: 'confirmed',
        });

        // Update service bookings status if any
        if (serviceBookingIds) {
          const serviceIds = JSON.parse(serviceBookingIds);
          await ServiceBooking.updateMany(
            { _id: { $in: serviceIds } },
            {
              paymentStatus: 'paid',
              status: 'confirmed',
            }
          );
        }

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const session = await stripe.checkout.sessions.retrieve(
          charge.metadata.checkout_session_id
        );
        const { bookingId, serviceBookingIds } = session.metadata!;

        // Update hall booking status
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'refunded',
          status: 'cancelled',
        });

        // Update service bookings status if any
        if (serviceBookingIds) {
          const serviceIds = JSON.parse(serviceBookingIds);
          await ServiceBooking.updateMany(
            { _id: { $in: serviceIds } },
            {
              paymentStatus: 'refunded',
              status: 'cancelled',
            }
          );
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
 