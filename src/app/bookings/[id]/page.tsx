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
  };
  userId: string | { _id: string };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  numberOfGuests: number;
  specialRequests?: string;
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
  const [showReschedule, setShowReschedule] = useState(false);
  const [newStartDate, setNewStartDate] = useState<string>('');
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [rescheduleSuccess, setRescheduleSuccess] = useState<string | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState<string | null>(null);
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
        router.push('/dashboard');
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

  // Calculate totals
  const hallTotal = booking?.totalPrice || 0;
  const servicesTotal = serviceBookings.reduce((sum, sb) => sum + sb.totalPrice, 0);
  const grandTotal = hallTotal + servicesTotal;

  // Updated payment handler
  const handlePayNow = async () => {
    if (!booking) return;
    setPayLoading(true);
    setPayError(null);
    setPaySuccess(null);
    try {
      // Create Razorpay order for hall + unpaid services
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking._id,
          serviceBookingIds: serviceBookings.map(sb => sb._id),
          amount: grandTotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error || 'Failed to create payment order');
        setPayLoading(false);
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
        description: `Booking from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}`,
        order_id: order.id,
        handler: async function (response: any) {
          // On payment success, update booking and service bookings
          const updateRes = await fetch(`/api/bookings/${booking._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentStatus: 'paid',
              status: 'confirmed',
              paymentId: response.razorpay_payment_id,
              serviceBookingIds: serviceBookings.map(sb => sb._id),
            }),
          });
          const updateData = await updateRes.json();
          if (updateRes.ok) {
            // Refresh booking and service bookings data
            const [bookingRes, servicesRes] = await Promise.all([
              fetch(`/api/bookings/${booking._id}`),
              fetch(`/api/service-bookings?hallBookingId=${booking._id}`)
            ]);
            const [bookingData, servicesData] = await Promise.all([
              bookingRes.json(),
              servicesRes.json()
            ]);
            setBooking(bookingData.booking);
            setServiceBookings(servicesData.bookings || []);
            setPaySuccess('Payment successful! Booking and services confirmed.');
          } else {
            setPayError(updateData.error || 'Payment succeeded but failed to update booking.');
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
      setPayError(err.message || 'Payment failed.');
    } finally {
      setPayLoading(false);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Booking Details
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Booking ID: {booking._id}
                  </p>
                </div>
                <Link
                  href="/dashboard"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>

            {/* Hall Details */}
            <div className="p-6 border-b">
              <div className="flex items-start space-x-6">
                <div className="relative w-48 h-48 flex-shrink-0">
                  <Image
                    src={booking.hallId.images[0]}
                    alt={booking.hallId.name}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {booking.hallId.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {booking.hallId.location.address}
                  </p>
                  <p className="text-gray-600">
                    {booking.hallId.location.city}, {booking.hallId.location.state}
                  </p>
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-900">Amenities</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Array.isArray(booking.hallId.amenities) &&
                        booking.hallId.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {amenity}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Booking Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Check-in Date</p>
                  <p className="font-medium">
                    {new Date(booking.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-out Date</p>
                  <p className="font-medium">
                    {new Date(booking.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Number of Guests</p>
                  <p className="font-medium">{booking.numberOfGuests}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">₹{hallTotal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking Status</p>
                  <p
                    className={`font-medium ${
                      booking.status === 'confirmed'
                        ? 'text-green-600'
                        : booking.status === 'cancelled'
                        ? 'text-red-600'
                        : booking.status === 'completed'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p
                    className={`font-medium ${
                      booking.paymentStatus === 'paid'
                        ? 'text-green-600'
                        : booking.paymentStatus === 'refunded'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {booking.paymentStatus.charAt(0).toUpperCase() +
                      booking.paymentStatus.slice(1)}
                  </p>
                </div>
              </div>
              {booking.specialRequests && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600">Special Requests</p>
                  <p className="mt-1 text-gray-900">{booking.specialRequests}</p>
                </div>
              )}
              {/* Add to Calendar Links */}
              <div className="mt-6 flex flex-col gap-2">
                <span className="font-medium text-gray-700">Add to Calendar:</span>
                <div className="flex gap-4">
                  <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Calendar</a>
                  <a href={outlookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Outlook</a>
                  <a href={icsUrl} download={`booking-${booking._id}.ics`} className="text-blue-600 underline">iCal (.ics)</a>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex justify-between">
                  <span>Services Total</span>
                  <span>₹{servicesTotal}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* --- Service Management Section --- */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold mb-4">Manage Services for this Booking</h3>
              <button
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                onClick={openServiceModal}
              >
                Add Service
              </button>
              {serviceBookings.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Added Services</h4>
                  <ul className="divide-y">
                    {serviceBookings.map(sb => (
                      <li key={sb._id} className="py-2 flex justify-between items-center">
                        <div>
                          <span className="font-medium">{sb.serviceId?.name}</span> ({sb.serviceId?.serviceType})
                          <span className="ml-2 text-gray-600">₹{sb.totalPrice}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            sb.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : sb.paymentStatus === 'refunded'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sb.paymentStatus === 'paid'
                              ? 'Paid'
                              : sb.paymentStatus === 'refunded'
                              ? 'Refunded'
                              : 'Payment Pending'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {servicePayError && <div className="text-red-600 mt-2">{servicePayError}</div>}
              {servicePaySuccess && <div className="text-green-600 mt-2">{servicePaySuccess}</div>}
            </div>

            {/* --- Add Service Modal --- */}
            <Dialog open={showServiceModal} onClose={() => setShowServiceModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 z-10">
                  <Dialog.Title className="text-lg font-bold mb-4">Add a Service</Dialog.Title>
                  {serviceLoading ? (
                    <div>Loading...</div>
                  ) : serviceError ? (
                    <div className="text-red-600">{serviceError}</div>
                  ) : (
                    <form onSubmit={handleAddService} className="space-y-4">
                      <select
                        value={selectedServiceId || ''}
                        onChange={e => setSelectedServiceId(e.target.value)}
                        className="w-full border rounded px-3 py-2"
                        required
                      >
                        <option value="">Select a service</option>
                        {availableServices.map(service => (
                          <option key={service._id} value={service._id}>
                            {service.name} ({service.serviceType}) - ₹{service.price}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                        disabled={servicePayLoading || !selectedServiceId}
                      >
                        {servicePayLoading ? 'Adding...' : 'Add Service'}
                      </button>
                    </form>
                  )}
                  <button
                    onClick={() => setShowServiceModal(false)}
                    className="mt-4 w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Dialog>
            {/* --- End Service Management Section --- */}

            {/* Actions */}
            <div className="p-6 flex flex-col gap-4">
              {canReschedule && (
                <button
                  onClick={() => {
                    setNewStartDate(booking.startDate.slice(0, 10));
                    setNewEndDate(booking.endDate.slice(0, 10));
                    setShowReschedule(true);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Modify Booking
                </button>
              )}
              {booking.status === 'confirmed' && (
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
              {booking && session && serviceBookings && serviceBookings.length > 0 && (
                <Link
                  href={`/messages?booking=${booking._id}`}
                  className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                >
                  Open Chat
                </Link>
              )}
              {/* Pay Now button for pending bookings or unpaid services */}
              {(booking.status === 'pending' && (booking.paymentStatus === 'pending' || servicesTotal > 0)) && (
                <button
                  onClick={handlePayNow}
                  disabled={payLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {payLoading ? 'Processing Payment...' : `Pay Now (₹${grandTotal})`}
                </button>
              )}
              {payError && <p className="text-red-600 mt-2">{payError}</p>}
              {paySuccess && <p className="text-green-600 mt-2">{paySuccess}</p>}
              {rescheduleError && <p className="text-red-600 mt-2">{rescheduleError}</p>}
              {rescheduleSuccess && <p className="text-green-600 mt-2">{rescheduleSuccess}</p>}
            </div>
          </div>
        </div>
      </div>
      {/* Reschedule Modal */}
      <Dialog open={showReschedule} onClose={() => setShowReschedule(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 z-10">
            <Dialog.Title className="text-lg font-bold mb-4">Modify Booking Dates</Dialog.Title>
            <div className="flex flex-col gap-4">
              <label className="flex flex-col">
                <span className="text-sm font-medium mb-1">New Start Date</span>
                <input
                  type="date"
                  value={newStartDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setNewStartDate(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm font-medium mb-1">New End Date</span>
                <input
                  type="date"
                  value={newEndDate}
                  min={newStartDate}
                  onChange={e => setNewEndDate(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </label>
              {rescheduleError && <p className="text-red-600">{rescheduleError}</p>}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleReschedule}
                  disabled={rescheduleLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {rescheduleLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowReschedule(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
 