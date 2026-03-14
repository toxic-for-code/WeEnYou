'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';
import { encode as encodeQuery } from 'querystring';

interface Booking {
  _id: string;
  hallId: {
    _id: string;
    name: string;
    images: string[];
    location: {
      city: string;
      state: string;
      address: string;
    };
    amenities: string[];
    description: string;
    ownerId?: string | { _id: string };
    price?: number;
    platformFeePercent?: number;
  };
  userId: string | { _id: string };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status:
    | 'pending_advance'
    | 'waiting_owner_confirmation'
    | 'owner_confirmed'
    | 'confirmed'
    | 'rejected'
    | 'cancelled'
    | 'completed';
  paymentStatus: 'pending' | 'paid' | 'partial_paid' | 'refund_pending' | 'refunded';
  finalOrderId?: string;
  createdAt: string;
  numberOfGuests: number;
  guests?: number;
  specialRequests?: string;
  advancePaid?: boolean;
  advanceAmount?: number;
  remainingBalance?: number;
  venuePrice?: number; // Persisted base venue rental
  bookingPaymentId?: string;
  finalPaymentStatus?: 'pending' | 'paid' | null;
  finalPaymentMethod?: 'online' | 'offline' | null;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function BookingDetails({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [newStartDate, setNewStartDate] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string | null>(null);

  // Advance Payment states
  const [advancePayLoading, setAdvancePayLoading] = useState(false);
  const [advancePayError, setAdvancePayError] = useState<string | null>(null);
  const [advancePaySuccess, setAdvancePaySuccess] = useState<string | null>(null);

  // Final Payment states
  const [finalPayLoading, setFinalPayLoading] = useState<boolean>(false);
  const [finalPayError, setFinalPayError] = useState<string | null>(null);
  const [finalPaySuccess, setFinalPaySuccess] = useState<string | null>(null);

  // Service Booking states
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceError, setServiceError] = useState('');
  const [serviceBookings, setServiceBookings] = useState<any[]>([]);
  const [servicePayLoading, setServicePayLoading] = useState(false);
  const [servicePayError, setServicePayError] = useState('');
  const [servicePaySuccess, setServicePaySuccess] = useState('');



  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${params.id}`);
        if (!response.ok) {
          throw new Error('Booking not found');
        }
        const data = await response.json();
        setBooking(data.booking);
      } catch (error) {
        console.error('Error fetching booking:', error);
        router.push('/profile');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchBooking();
    }
  }, [session, params.id, router]);

  // Fetch service bookings for this booking
  useEffect(() => {
    const fetchServiceBookings = async () => {
      if (!booking) return;
      setServiceLoading(true);
      try {
        const res = await fetch(`/api/service-bookings?hallBookingId=${booking._id}`);
        if (!res.ok) throw new Error('Failed to fetch service bookings');
        const data = await res.json();
        // Ensure we have all the required data for messaging
        const bookings = data.bookings.map((sb: any) => ({
          ...sb,
          providerId: sb.serviceId?.providerId,
        }));
        setServiceBookings(bookings);
      } catch (error) {
        console.error('Error fetching service bookings:', error);
        setServiceBookings([]);
      } finally {
        setServiceLoading(false);
      }
    };
    if (booking) fetchServiceBookings();
  }, [booking]);

  const handleCancelBooking = async () => {
    if (!booking || !confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await fetch(`/api/bookings/${booking._id}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      const data = await response.json();
      setBooking(data.booking);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const canReschedule = booking && booking.status === 'confirmed' && (new Date(booking.startDate).getTime() - Date.now() > 48 * 60 * 60 * 1000);

  const handleReschedule = async () => {
    setRescheduleLoading(true);
    setRescheduleError(null);
    setRescheduleSuccess(null);
    try {
      const response = await fetch(`/api/bookings/${booking?._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: newStartDate, endDate: newEndDate }),
      });
      const data = await response.json();
      if (!response.ok) {
        setRescheduleError(data.error || 'Failed to reschedule.');
      } else {
        setBooking(data.booking);
        setRescheduleSuccess('Booking rescheduled successfully!');
        setShowReschedule(false);
      }
    } catch (err) {
      setRescheduleError('Failed to reschedule. Please try again.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  // Calculate totals & breakdown for display
  const start = booking ? new Date(booking.startDate) : new Date();
  const end = booking ? new Date(booking.endDate) : new Date();
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Re-derive hall pricing components for display
  // Note: We prioritize the persisted venuePrice, fallback to hall.price
  const dailyPrice = booking?.venuePrice ? (booking.venuePrice / totalDays) : ((booking?.hallId as any)?.price || 0);
  const venueRental = booking?.venuePrice || (dailyPrice * totalDays);
  const platformFeePercent = typeof (booking?.hallId as any)?.platformFeePercent === 'number' ? (booking?.hallId as any).platformFeePercent : 10;
  const platformFee = Math.round(dailyPrice * (platformFeePercent / 100));
  const taxAmount = Math.round(platformFee * 0.18);

  const hallTotal = booking?.totalPrice || 0;
  const servicesTotal = serviceBookings.reduce((sum, sb) => sum + sb.totalPrice, 0);
  const grandTotal = hallTotal + servicesTotal;



  // ── Advance payment handler (pending_advance → owner_approval_pending) ──
  const handlePayAdvance = async () => {
    if (!booking) return;
    const advanceAmount = Math.min(booking.totalPrice * 0.5, 50000);
    setAdvancePayLoading(true);
    setAdvancePayError(null);
    setAdvancePaySuccess(null);
    try {
      // 1. Create Razorpay advance order — bookingId saved so webhook can find it
      const orderRes = await fetch('/api/payments/create-advance-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking._id,
          userId: typeof booking.userId === 'string' ? booking.userId : (booking.userId as any)._id,
          hallId: booking.hallId._id,
          totalAmount: booking.totalPrice,
          advance: advanceAmount,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setAdvancePayError(orderData.error || 'Failed to create advance order.');
        return;
      }
      // 2. Load Razorpay if needed
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      // 3. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: 'rzp_test_EvcFsJFi50khcp',
        amount: orderData.amount,
        currency: orderData.currency,
        name: booking.hallId.name,
        description: `Advance payment for booking from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 4. Verify payment via unified /api/payments/verify endpoint
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: booking._id,
              type: 'advance',
              advanceAmount,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            // Update booking state from verified response
            setBooking(verifyData.booking);
            setAdvancePaySuccess('Advance paid! Pending Confirmation from the owner.');
          } else {
            setAdvancePayError(verifyData.error || 'Signature verification failed.');
          }
        },
        prefill: { name: session?.user?.name, email: session?.user?.email },
        theme: { color: '#111111' },
      });
      rzp.open();
    } catch (err: any) {
      setAdvancePayError(err.message || 'Advance payment failed.');
    } finally {
      setAdvancePayLoading(false);
    }
  };

  // Fetch available services for the hall's city
  const openServiceModal = async () => {
    setShowServiceModal(true);
    setServiceLoading(true);
    setServiceError('');
    try {
      const res = await fetch(`/api/services?city=${booking?.hallId.location.city}`);
      const data = await res.json();
      setAvailableServices(data.services || []);
    } catch {
      setServiceError('Failed to load services');
    } finally {
      setServiceLoading(false);
    }
  };

  // Book a selected service
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !booking) return;
    setServicePayLoading(true);
    setServicePayError('');
    setServicePaySuccess('');
    try {
      const service = availableServices.find(s => s._id === selectedServiceId);
      const res = await fetch('/api/service-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          hallId: booking.hallId._id,
          hallBookingId: booking._id,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: service.price,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book service');
      setServicePaySuccess('Service added! Please complete payment if required.');
      setShowServiceModal(false);
      setSelectedServiceId(null);
      // Refresh service bookings
      const bookingsRes = await fetch(`/api/service-bookings?hallBookingId=${booking._id}`);
      const bookingsData = await bookingsRes.json();
      setServiceBookings(bookingsData.bookings || []);
    } catch (err: any) {
      setServicePayError(err.message || 'Failed to add service');
    } finally {
      setServicePayLoading(false);
    }
  };

  const handleFinalPayNow = async () => {
    if (!booking) return;
    setFinalPayLoading(true);
    setFinalPayError(null);
    setFinalPaySuccess(null);
    try {
      // Create Razorpay order for remaining amount using dedicated create-final API
      const res = await fetch('/api/payments/create-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking._id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFinalPayError(data.error || 'Failed to create final payment order');
        setFinalPayLoading(false);
        return;
      }
      const order = data.order;
      // Load Razorpay script if not loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }
      // Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: "rzp_test_EvcFsJFi50khcp",
        amount: order.amount,
        currency: order.currency,
        name: booking.hallId.name,
        description: `Final payment for booking from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}`,
        order_id: order.id,
        handler: async function (response: any) {
          // On payment success, verify final payment via verify-final
          const verifyRes = await fetch('/api/payments/verify-final', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: booking._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            setBooking(verifyData.booking);
            setFinalPaySuccess('Final payment successful! Booking is now fully confirmed.');
          } else {
            setFinalPayError(verifyData.error || 'Payment succeeded but signature verification failed.');
          }
        },
        prefill: {
          name: session?.user?.name,
          email: session?.user?.email,
        },
        theme: { color: '#2563eb' },
      });
      rzp.open();
    } catch (err: any) {
      setFinalPayError(err.message || 'Payment failed.');
    } finally {
      setFinalPayLoading(false);
    }
  };

  const handlePayOffline = async () => {
    if (!booking) return;
    setFinalPayLoading(true);
    setFinalPayError(null);
    setFinalPaySuccess(null);
    try {
      const updateRes = await fetch(`/api/bookings/${booking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finalPaymentStatus: 'pending',
          finalPaymentMethod: 'offline',
        }),
      });
      const updateData = await updateRes.json();
      if (updateRes.ok) {
        setBooking(updateData.booking);
        setFinalPaySuccess('You have chosen to pay the remaining amount offline at the venue.');
      } else {
        setFinalPayError(updateData.error || 'Failed to update booking.');
      }
    } catch (err: any) {
      setFinalPayError(err.message || 'Failed to update booking.');
    } finally {
      setFinalPayLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!booking) return;
    setDownloadingInvoice(true);
    try {
      const response = await fetch(`/api/invoices/${booking._id}`);
      if (!response.ok) throw new Error('Failed to generate invoice');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${booking._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not download invoice. Please try again later.');
    } finally {
      setDownloadingInvoice(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  // Calendar event details
  const eventTitle = `Event Hall Booking: ${booking.hallId.name}`;
  const eventLocation = `${booking.hallId.location.address}, ${booking.hallId.location.city}, ${booking.hallId.location.state}`;
  const eventDescription = `Booking at ${booking.hallId.name}\nGuests: ${booking.numberOfGuests}\nSpecial Requests: ${booking.specialRequests || 'None'}`;
  const startISO = new Date(booking.startDate).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const endISO = new Date(booking.endDate).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startISO}/${endISO}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(eventLocation)}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventTitle)}&body=${encodeURIComponent(eventDescription)}&startdt=${booking.startDate}&enddt=${booking.endDate}&location=${encodeURIComponent(eventLocation)}`;
  const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${eventTitle}\nDTSTART:${startISO}\nDTEND:${endISO}\nDESCRIPTION:${eventDescription}\nLOCATION:${eventLocation}\nEND:VEVENT\nEND:VCALENDAR`;
  const icsUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

  return (
    <div className="page-mobile-first min-h-screen bg-gray-50 w-full min-w-0 overflow-x-hidden pb-10">

      {/* Hero Image */}
      <div className="relative w-full h-56 sm:h-72 bg-gray-200">
        {booking.hallId.images?.[0] ? (
          <Image
            src={booking.hallId.images[0]}
            alt={booking.hallId.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Back Button Overlay */}
        <div className="absolute top-4 left-4">
          <Link
            href="/profile"
            className="flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white text-sm font-bold px-4 py-2.5 rounded-full transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10">

        {/* Venue Information Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 mb-4 border border-gray-100">
          <h1 className="text-2xl font-black text-gray-900 leading-tight">{booking.hallId.name}</h1>
          <p className="text-sm text-gray-500 mt-1.5 flex items-start gap-1.5">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {[booking.hallId.location.address, booking.hallId.location.city, booking.hallId.location.state].filter(Boolean).join(', ')}
          </p>
          <p className="text-[10px] font-mono text-gray-300 mt-2">Booking ID: {booking._id}</p>

          {/* Amenities */}
          {Array.isArray(booking.hallId.amenities) && booking.hallId.amenities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {booking.hallId.amenities.map((amenity) => (
                <span key={amenity} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Booking Status Card — one card per workflow state */}
        {(() => {
          const s = booking.status;
          const isRejected   = s === 'rejected';
          const isCancelled  = s === 'cancelled';
          const isConfirmed  = s === 'confirmed';
          const isCompleted  = s === 'completed';
          const isWaiting    = s === 'waiting_owner_confirmation';
          const isApproved   = s === 'owner_confirmed';
          const isPendingAdv = s === 'pending_advance';

          const colors = isRejected || isCancelled
            ? { bg: 'bg-red-50 border-red-200', icon: 'bg-red-100 text-red-700', text: 'text-red-700' }
            : isConfirmed || isCompleted
            ? { bg: 'bg-green-50 border-green-200', icon: 'bg-green-100 text-green-700', text: 'text-green-700' }
            : isApproved
            ? { bg: 'bg-blue-50 border-blue-200', icon: 'bg-blue-100 text-blue-700', text: 'text-blue-700' }
            : isWaiting
            ? { bg: 'bg-purple-50 border-purple-200', icon: 'bg-purple-100 text-purple-700', text: 'text-purple-700' }
            : { bg: 'bg-amber-50 border-amber-200', icon: 'bg-amber-100 text-amber-700', text: 'text-amber-700' };

          const statusLabel =
            s === 'waiting_owner_confirmation' ? 'Booking Processing'
            : s === 'owner_confirmed'  ? 'Owner Confirmed'
            : s === 'pending_advance'  ? 'Pending Advance Payment'
            : s === 'rejected'         ? 'Booking Rejected'
            : s === 'completed'        ? 'Completed'
            : s === 'confirmed'        ? 'Confirmed'
            : s === 'cancelled'        ? 'Cancelled'
            : s as string;

          const payLabel =
            booking.paymentStatus === 'paid' && (booking.remainingBalance ?? 0) > 0 ? `Advance Paid · ₹${(booking.remainingBalance ?? 0).toLocaleString()} remaining`
            : booking.paymentStatus === 'paid'           ? 'Fully Paid'
            : booking.paymentStatus === 'partial_paid' || (booking.advancePaid && (booking.remainingBalance ?? 0) > 0) ? `Advance Paid · ₹${(booking.remainingBalance ?? 0).toLocaleString()} remaining`
            : booking.paymentStatus === 'refund_pending' ? 'Refund Processing'
            : booking.paymentStatus === 'refunded'     ? 'Refunded'
            : 'Payment Pending';

          const payColor =
            booking.paymentStatus === 'paid' && (booking.remainingBalance ?? 0) > 0 ? 'text-blue-600'
            : booking.paymentStatus === 'paid'           ? 'text-green-600'
            : booking.paymentStatus === 'partial_paid' || booking.advancePaid ? 'text-blue-600'
            : booking.paymentStatus === 'refund_pending' || booking.paymentStatus === 'refunded' ? 'text-purple-600'
            : 'text-amber-600';

          return (
            <div className={`rounded-3xl p-5 mb-4 border ${colors.bg}`}>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl flex-shrink-0 ${colors.icon}`}>
                  {isConfirmed ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  ) : isRejected || isCancelled ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  ) : isWaiting ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Booking Status</p>
                  <p className={`text-lg font-black mt-0.5 ${colors.text}`}>{statusLabel}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${payColor}`}>{payLabel}</p>

                  {/* State-specific info messages */}
                  {isWaiting && (
                    <p className="text-xs text-purple-600 mt-2 leading-relaxed">
                      Your advance of ₹{(booking.advanceAmount || Math.min(booking.totalPrice * 0.5, 50000)).toLocaleString()} has been received.
                      The owner will review and confirm your booking shortly.
                    </p>
                  )}
                  {isApproved && (
                    <p className="text-xs text-blue-600 mt-2 leading-relaxed">
                      The owner has approved your request! Please pay the remaining balance to fully confirm your booking.
                    </p>
                  )}
                  {isRejected && (
                    <p className="text-xs text-red-600 mt-2 leading-relaxed">
                      The owner rejected this booking. Your advance of ₹{(booking.advanceAmount ?? 0).toLocaleString()} will be refunded within 5–7 business days.
                    </p>
                  )}
                </div>
              </div>

              {/* Pay Advance CTA — only shown when pending_advance */}
              {isPendingAdv && (
                <div className="mt-4 pt-4 border-t border-amber-200">
                  {advancePayError && <p className="text-xs text-red-600 mb-2">{advancePayError}</p>}
                  {advancePaySuccess && <p className="text-xs text-green-700 mb-2 font-semibold">{advancePaySuccess}</p>}
                  <button
                    onClick={handlePayAdvance}
                    disabled={advancePayLoading}
                    className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-black text-sm rounded-2xl transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg"
                  >
                    {advancePayLoading ? 'Opening payment…' : `Pay Advance — ₹${Math.min(booking.totalPrice * 0.5, 50000).toLocaleString()}`}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2">50% advance required · secure Razorpay checkout</p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Event Details Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 mb-4 border border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Event Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">Check-in Date</span>
              <span className="text-sm font-bold text-gray-900">{new Date(booking.startDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">Check-out Date</span>
              <span className="text-sm font-bold text-gray-900">{new Date(booking.endDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 font-medium">Number of Guests</span>
              <span className="text-sm font-bold text-gray-900">{booking.numberOfGuests ?? booking.guests ?? '—'} People</span>
            </div>
            {booking.specialRequests && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5">Special Requests</p>
                <p className="text-sm text-gray-700">{booking.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Calendar Links */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Add to Calendar</p>
            <div className="flex flex-wrap gap-3">
              <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm font-bold hover:underline">Google</a>
              <a href={outlookUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 text-sm font-bold hover:underline">Outlook</a>
              <a href={icsUrl} download={`booking-${booking._id}.ics`} className="text-primary-600 text-sm font-bold hover:underline">iCal</a>
            </div>
          </div>
        </div>

        {/* Price Summary Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 mb-4 border border-gray-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Price Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Venue Rental ({totalDays > 1 ? `₹${dailyPrice.toLocaleString()} x ${totalDays} days` : `₹${dailyPrice.toLocaleString()} for 1 day`})</span>
              <span className="font-semibold text-gray-700">₹{venueRental.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Platform Fee (one-time)</span>
              <span className="font-semibold text-gray-700">₹{platformFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxes</span>
              <span className="font-semibold text-gray-700">₹{taxAmount.toLocaleString()}</span>
            </div>
            {servicesTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Services Total</span>
                <span className="font-semibold text-gray-700">₹{servicesTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="text-base font-black text-gray-900">Grand Total</span>
              <span className="text-2xl font-black text-gray-900">₹{grandTotal.toLocaleString()}</span>
            </div>

            {/* Added: Advance Paid & Remaining Balance Breakdown */}
            {(booking.advancePaid || booking.paymentStatus === 'paid' || booking.paymentStatus === 'partial_paid') && (
              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-medium">Advance Paid</span>
                  <span className="font-bold text-green-600">
                    - ₹{(booking.advanceAmount || Math.min(booking.totalPrice * 0.5, 50000)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-900 font-black">Remaining to Pay</span>
                  <span className="font-black text-primary-600">
                    ₹{(booking.remainingBalance ?? (grandTotal - (booking.advanceAmount || Math.min(booking.totalPrice * 0.5, 50000)))).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Remaining balance — shown when owner_confirmed + advance was paid */}
          {booking.status === 'owner_confirmed' && (booking.paymentStatus === 'paid' || booking.advancePaid) && booking.finalPaymentStatus !== 'paid' && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <p className="text-sm font-black text-blue-800 mb-1">Remaining Balance Due</p>
              <p className="text-2xl font-black text-blue-700">₹{(booking.remainingBalance ?? (booking.totalPrice - Math.min(50000, booking.totalPrice * 0.5))).toLocaleString()}</p>
              <p className="text-xs text-blue-500 mb-3">Advance of ₹{(booking.advanceAmount || Math.min(booking.totalPrice * 0.5, 50000)).toLocaleString()} already paid</p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleFinalPayNow}
                  disabled={finalPayLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {finalPayLoading ? 'Processing…' : 'Pay Remaining (Online)'}
                </button>
                <button
                  onClick={handlePayOffline}
                  disabled={finalPayLoading}
                  className="w-full py-3 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 font-bold text-sm rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Mark as Pay at Venue
                </button>
              </div>
              {finalPayError && <p className="mt-2 text-xs text-red-600">{finalPayError}</p>}
              {finalPaySuccess && <p className="mt-2 text-xs text-green-700 font-semibold">{finalPaySuccess}</p>}
            </div>
          )}

          {/* Refund pending notice */}
          {(booking.status === 'rejected' || booking.paymentStatus === 'refund_pending') && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-2xl">
              <p className="text-sm font-black text-purple-800">Refund Processing</p>
              <p className="text-xs text-purple-600 mt-1">Your advance of ₹{(booking.advanceAmount ?? 0).toLocaleString()} will be refunded within 5–7 business days to your original payment method.</p>
            </div>
          )}

          {/* Completed notice */}
          {booking.status === 'completed' && booking.paymentStatus === 'paid' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-2xl">
              <p className="text-sm font-black text-green-800">✓ Fully Paid & Completed</p>
              <p className="text-xs text-green-600 mt-1">Total paid: ₹{grandTotal.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 mb-4 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Added Services</h3>
            <button
              onClick={openServiceModal}
              className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline"
            >
              + Add Service
            </button>
          </div>
          {serviceBookings.length === 0 ? (
            <p className="text-sm text-gray-400 font-medium">No services added yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {serviceBookings.map(sb => (
                <li key={sb._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{sb.serviceId?.name}</p>
                    <p className="text-xs text-gray-400">{sb.serviceId?.serviceType} · ₹{sb.totalPrice.toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                    sb.paymentStatus === 'paid' ? 'bg-green-100 text-green-700'
                    : sb.paymentStatus === 'refunded' ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                  }`}>
                    {sb.paymentStatus === 'paid' ? 'Paid' : sb.paymentStatus === 'refunded' ? 'Refunded' : 'Pending'}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {servicePayError && <p className="text-red-600 text-sm mt-2">{servicePayError}</p>}
          {servicePaySuccess && <p className="text-green-600 text-sm mt-2">{servicePaySuccess}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-2">

          {/* Pay Advance */}
          {booking.status === 'pending_advance' && (booking.paymentStatus === 'pending' || servicesTotal > 0) && (
            <button
              onClick={handlePayAdvance}
              disabled={advancePayLoading}
              className="w-full py-4 bg-[#111111] hover:bg-black text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {advancePayLoading ? 'Processing...' : `Pay Advance — ₹${Math.min(booking.totalPrice * 0.5, 50000).toLocaleString()}`}
            </button>
          )}
          {advancePayError && <p className="text-red-600 text-sm font-medium">{advancePayError}</p>}
          {advancePaySuccess && <p className="text-green-600 text-sm font-medium">{advancePaySuccess}</p>}

          {/* Download Invoice */}
          <button
            onClick={handleDownloadInvoice}
            disabled={downloadingInvoice}
            className="w-full py-4 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-900 font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {downloadingInvoice ? (
              <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            )}
            {downloadingInvoice ? 'Generating Invoice...' : 'Download Invoice'}
          </button>

          {/* Contact Venue / Open Chat */}
          {booking && session && serviceBookings.length > 0 && (
            <Link
              href={`/messages?booking=${booking._id}`}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Contact Venue
            </Link>
          )}

          {/* Reschedule */}
          {canReschedule && (
            <button
              onClick={() => {
                setNewStartDate(booking.startDate.slice(0, 10));
                setNewEndDate(booking.endDate.slice(0, 10));
                setShowReschedule(true);
              }}
              className="w-full py-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Modify Booking Dates
            </button>
          )}
          {rescheduleError && <p className="text-red-600 text-sm font-medium">{rescheduleError}</p>}
          {rescheduleSuccess && <p className="text-green-600 text-sm font-medium">{rescheduleSuccess}</p>}

          {/* Cancel Booking */}
          {booking.status === 'confirmed' && (
            <button
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-black text-sm rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
        </div>

      </div>

      {/* Reschedule Modal */}
      <Dialog open={showReschedule} onClose={() => setShowReschedule(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-end sm:items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full mx-auto p-6 z-10">
            <Dialog.Title className="text-xl font-black text-gray-900 mb-5">Modify Booking Dates</Dialog.Title>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">New Start Date</span>
                <input
                  type="date"
                  value={newStartDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setNewStartDate(e.target.value)}
                  className="border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-black text-gray-400 uppercase tracking-wider">New End Date</span>
                <input
                  type="date"
                  value={newEndDate}
                  min={newStartDate}
                  onChange={e => setNewEndDate(e.target.value)}
                  className="border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                />
              </label>
              {rescheduleError && <p className="text-red-600 text-sm">{rescheduleError}</p>}
              <div className="flex flex-col gap-3 mt-2">
                <button
                  onClick={handleReschedule}
                  disabled={rescheduleLoading}
                  className="w-full py-4 bg-[#111111] text-white font-black text-sm rounded-2xl disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {rescheduleLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowReschedule(false)}
                  className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm rounded-2xl transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Add Service Modal */}
      <Dialog open={showServiceModal} onClose={() => setShowServiceModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-end sm:items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full mx-auto p-6 z-10">
            <Dialog.Title className="text-xl font-black text-gray-900 mb-5">Add a Service</Dialog.Title>
            {serviceLoading ? (
              <div className="flex items-center gap-2 py-4 text-gray-400">
                <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full" />
                <span className="text-sm font-bold">Loading services...</span>
              </div>
            ) : serviceError ? (
              <div className="text-red-600 text-sm">{serviceError}</div>
            ) : (
              <form onSubmit={handleAddService} className="flex flex-col gap-4">
                <select
                  value={selectedServiceId || ''}
                  onChange={e => setSelectedServiceId(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                  required
                >
                  <option value="">Select a service</option>
                  {availableServices.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.name} ({service.serviceType}) – ₹{service.price}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full py-4 bg-[#111111] text-white font-black text-sm rounded-2xl disabled:opacity-50 transition-all active:scale-[0.98]"
                  disabled={servicePayLoading || !selectedServiceId}
                >
                  {servicePayLoading ? 'Adding...' : 'Add Service'}
                </button>
              </form>
            )}
            <button
              onClick={() => setShowServiceModal(false)}
              className="mt-3 w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-sm rounded-2xl transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog>

    </div>
  );
}