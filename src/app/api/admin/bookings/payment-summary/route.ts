import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import BookingPayment from '@/models/BookingPayment';
import Booking from '@/models/Booking';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, hallId } = body as { userId?: string; hallId?: string };
    if (!userId || !hallId) {
      return NextResponse.json({ error: 'Missing userId or hallId' }, { status: 400 });
    }

    // Fetch latest BookingPayment for this user-hall pair
    const payment = await BookingPayment.findOne({ userId, hallId }).sort({ createdAt: -1 }).lean();

    // Also check latest Booking for this pair to derive advancePaid if needed
    const booking = await Booking.findOne({ userId, hallId }).sort({ createdAt: -1 }).select('advancePaid paymentStatus totalPrice status').lean();

    const advancePaidFromBooking = !!booking?.advancePaid;
    const advancePaidFromPayment = payment?.advancePaymentStatus === 'paid';
    const advancePaid = advancePaidFromBooking || advancePaidFromPayment;

    const remainingPaymentStatus = payment?.remainingPaymentStatus || undefined;
    const advanceAmountPaid = typeof payment?.advanceAmountPaid === 'number' ? payment?.advanceAmountPaid : 0;
    const totalPrice = typeof booking?.totalPrice === 'number' ? booking.totalPrice : undefined;
    // Strict rule: remaining = total - advance (unless explicitly paid)
    const computedRemaining = typeof totalPrice === 'number'
      ? Math.max(totalPrice - (advanceAmountPaid || 0), 0)
      : undefined;
    const remainingAmount = remainingPaymentStatus === 'paid' ? 0 : computedRemaining;

    return NextResponse.json({
      summary: {
        advancePaid,
        advanceAmountPaid,
        remainingAmount,
        remainingPaymentStatus,
        source: advancePaidFromPayment ? 'payment' : (advancePaidFromBooking ? 'booking' : 'unknown'),
      }
    });
  } catch (e: any) {
    console.error('admin/bookings/payment-summary error', e);
    return NextResponse.json({ error: 'Failed to fetch payment summary' }, { status: 500 });
  }
}