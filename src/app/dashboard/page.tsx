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
    };
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        const data = await response.json();
        setBookings(data.bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchBookings();
    }
  }, [session]);

  const filteredBookings = bookings.filter((booking) => {
    const isPast = new Date(booking.endDate) < new Date();
    return activeTab === 'past' ? isPast : !isPast;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-1">
                Manage your hall bookings and view booking history
              </p>
            </div>

            {/* Tabs */}
            <div className="border-b">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'upcoming'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Upcoming Bookings
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'past'
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Past Bookings
                </button>
              </nav>
            </div>

            {/* Bookings List */}
            <div className="divide-y">
              {filteredBookings.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600">No bookings found</p>
                  <Link
                    href="/halls"
                    className="mt-4 inline-block text-primary-600 hover:text-primary-700"
                  >
                    Browse halls
                  </Link>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div key={booking._id} className="p-6">
                    <div className="flex items-start space-x-6">
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <Image
                          src={booking.hallId.images[0]}
                          alt={booking.hallId.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.hallId.name}
                            </h3>
                            <p className="text-gray-600">
                              {booking.hallId.location.city}, {booking.hallId.location.state}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : booking.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Check-in</p>
                            <p className="font-medium">
                              {new Date(booking.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Check-out</p>
                            <p className="font-medium">
                              {new Date(booking.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-medium">₹{booking.totalPrice}</p>
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
                        <div className="mt-4 flex space-x-4">
                          <Link
                            href={`/bookings/${booking._id}`}
                            className="text-primary-600 hover:text-primary-700 font-medium"
                          >
                            View Details
                          </Link>
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => {
                                // Handle cancellation
                              }}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 