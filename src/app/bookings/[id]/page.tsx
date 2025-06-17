'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export default function BookingDetails({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

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
                      {booking.hallId.amenities.map((amenity) => (
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
                  <p className="font-medium">₹{booking.totalPrice}</p>
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
            </div>

            {/* Actions */}
            <div className="p-6">
              {booking.status === 'confirmed' && (
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 