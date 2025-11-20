'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';

interface Hall {
  _id: string;
  name: string;
  images: string[];
  location: {
    city: string;
    state: string;
  };
  price: number;
  capacity: number;
  status: 'active' | 'inactive';
  bookings: {
    total: number;
    upcoming: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
}

interface Booking {
  _id: string;
  hallId: {
    _id: string;
    name: string;
    images: string[];
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface DashboardStats {
  totalHalls: number;
  totalBookings: number;
  totalUsers: number;
  totalServices: number;
  pendingHalls: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'halls' | 'bookings' | 'support'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<any>(null);
  const [supportRequests, setSupportRequests] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchDashboardStats();
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hallsResponse, bookingsResponse, supportResponse] = await Promise.all([
          fetch('/api/admin/halls'),
          fetch('/api/admin/bookings?limit=5'),
          fetch('/api/admin/support-requests'),
        ]);

        const hallsData = await hallsResponse.json();
        const bookingsData = await bookingsResponse.json();
        const supportData = await supportResponse.json();

        setHalls(hallsData.halls);
        setRecentBookings(bookingsData.bookings);
        setSupportRequests(supportData.requests || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchDashboardStats = async () => {
    try {
      const [statsResponse, notificationsResponse] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/notifications')
      ]);
      
      const statsData = await statsResponse.json();
      const notificationsData = await notificationsResponse.json();
      
      setStats(statsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalRevenue = halls.reduce((sum, hall) => sum + hall.revenue.total, 0);
  const totalBookings = halls.reduce((sum, hall) => sum + hall.bookings.total, 0);
  const totalUpcomingBookings = halls.reduce((sum, hall) => sum + hall.bookings.upcoming, 0);

  return (
    <div className="flex-1">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Halls</h2>
          <p className="text-3xl font-bold">{stats?.totalHalls}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Bookings</h2>
          <p className="text-3xl font-bold">{stats?.totalBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold">{stats?.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Services</h2>
          <p className="text-3xl font-bold">{stats?.totalServices}</p>
        </div>
      </div>
      
      {/* Pending Halls Alert */}
      {stats?.pendingHalls && stats.pendingHalls > 0 && (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>{stats.pendingHalls} hall(s)</strong> are waiting for approval.
                {notifications?.hasNewSubmissions && (
                  <span className="ml-2 text-orange-600 font-semibold">New submissions detected!</span>
                )}
              </p>
              <div className="mt-2">
                <Link
                  href="/admin/halls?tab=pending"
                  className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                >
                  Review pending halls →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      {notifications?.recentPendingHalls && notifications.recentPendingHalls.length > 0 && (
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Recent submissions</strong> from the last 7 days:
              </p>
              <div className="mt-2 space-y-1">
                {notifications.recentPendingHalls.slice(0, 3).map((hall: any) => (
                  <div key={hall._id} className="text-xs text-blue-600">
                    • {hall.name} by {hall.ownerId.name} ({new Date(hall.createdAt).toLocaleDateString()})
                  </div>
                ))}
                {notifications.recentPendingHalls.length > 3 && (
                  <div className="text-xs text-blue-600">
                    • ... and {notifications.recentPendingHalls.length - 3} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <h2 className="text-2xl font-bold mb-4 mt-8">Dashboard</h2>
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('halls')}
            className={`${
              activeTab === 'halls'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Halls
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`${
              activeTab === 'bookings'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Bookings
          </button>
          {session?.user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('support')}
              className={`${
                activeTab === 'support'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Support Requests
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Revenue
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ₹{totalRevenue.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Bookings
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {totalBookings}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Upcoming Bookings
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {totalUpcomingBookings}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Bookings
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <li key={booking._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="relative h-12 w-12 flex-shrink-0">
                          {booking.hallId && booking.hallId.images && booking.hallId.images[0] ? (
                            <Image
                              src={getImageUrl(booking.hallId.images[0])}
                              alt={booking.hallId.name}
                              fill
                              className="object-cover rounded-lg"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {booking.hallId && booking.hallId.name ? booking.hallId.name : 'Hall deleted'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.userId.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{booking.totalPrice}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
              <Link
                href="/admin/bookings"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all bookings
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'halls' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Your Halls</h3>
            <Link
              href="/admin/halls/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add New Hall
            </Link>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {halls.map((hall) => (
                <li key={hall._id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <Image
                          src={getImageUrl(hall.images[0])}
                          alt={hall.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {hall.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {hall.location.city}, {hall.location.state}
                        </p>
                        <div className="mt-1 flex items-center">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              hall.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {hall.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{hall.price}/day
                      </p>
                      <p className="text-sm text-gray-500">
                        Capacity: {hall.capacity}
                      </p>
                      <div className="mt-2">
                        <Link
                          href={`/admin/halls/${hall._id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">All Bookings</h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {recentBookings.map((booking) => (
                <li key={booking._id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative h-12 w-12 flex-shrink-0">
                        {booking.hallId && booking.hallId.images && booking.hallId.images[0] ? (
                          <Image
                            src={getImageUrl(booking.hallId.images[0])}
                            alt={booking.hallId.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {booking.hallId && booking.hallId.name ? booking.hallId.name : 'Hall deleted'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.userId.name} ({booking.userId.email})
                        </p>
                        <div className="mt-1 flex items-center">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : booking.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{booking.totalPrice}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.startDate).toLocaleDateString()} -{' '}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <div className="mt-2">
                        <Link
                          href={`/admin/bookings/${booking._id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="bg-white rounded-lg shadow p-6 mt-4">
          <h2 className="text-2xl font-bold mb-4">Support Requests</h2>
          {supportRequests.length === 0 ? (
            <div className="text-gray-500">No support requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Date</th>
                    <th className="px-4 py-2 border">User</th>
                    <th className="px-4 py-2 border">Email</th>
                    <th className="px-4 py-2 border">Subject</th>
                    <th className="px-4 py-2 border">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {supportRequests.map((req) => (
                    <tr key={req._id} className="border-b">
                      <td className="px-4 py-2 border whitespace-nowrap">{new Date(req.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{req.user?.name || 'N/A'}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{req.email}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{req.subject}</td>
                      <td className="px-4 py-2 border max-w-xs truncate" title={req.message}>{req.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
 