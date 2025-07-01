'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Analytics {
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  totalHalls: number;
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
  bookingsByStatus: {
    status: string;
    count: number;
  }[];
  userGrowth: {
    month: string;
    count: number;
  }[];
  popularHalls: {
    _id: string;
    name: string;
    bookingsCount: number;
    revenue: number;
  }[];
}

export default function AdminAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeframe, setTimeframe] = useState('month'); // month, quarter, year

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchAnalytics();
    }
  }, [session, status, router, timeframe]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/admin/analytics?timeframe=${timeframe}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!analytics) return <div>No data available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
          <p className="text-3xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Bookings</h3>
          <p className="text-3xl font-bold">{analytics.totalBookings}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
          <p className="text-3xl font-bold">{analytics.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Halls</h3>
          <p className="text-3xl font-bold">{analytics.totalHalls}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Revenue Trend</h3>
          <div className="h-64">
            {/* Revenue line chart */}
            <div className="relative h-full">
              {analytics.revenueByMonth.map((item, index) => (
                <div
                  key={item.month}
                  className="absolute bottom-0 bg-blue-500"
                  style={{
                    left: `${(index / analytics.revenueByMonth.length) * 100}%`,
                    width: `${100 / analytics.revenueByMonth.length}%`,
                    height: `${(item.revenue / Math.max(...analytics.revenueByMonth.map(i => i.revenue))) * 100}%`,
                  }}
                >
                  <div className="text-xs text-white text-center mt-2">
                    ₹{item.revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-4">
            {analytics.revenueByMonth.map(item => (
              <div key={item.month} className="text-sm text-gray-600">
                {item.month}
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Bookings by Status</h3>
          <div className="flex items-center space-x-4">
            {analytics.bookingsByStatus.map(item => (
              <div key={item.status} className="flex-1">
                <div className="text-center mb-2">{item.status}</div>
                <div
                  className={`h-32 rounded-t-lg ${
                    item.status === 'confirmed' ? 'bg-green-500' :
                    item.status === 'cancelled' ? 'bg-red-500' :
                    item.status === 'completed' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}
                  style={{
                    height: `${(item.count / Math.max(...analytics.bookingsByStatus.map(i => i.count))) * 128}px`
                  }}
                />
                <div className="text-center mt-2">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">User Growth</h3>
          <div className="h-64">
            {/* User growth line chart */}
            <div className="relative h-full">
              {analytics.userGrowth.map((item, index) => (
                <div
                  key={item.month}
                  className="absolute bottom-0 bg-green-500"
                  style={{
                    left: `${(index / analytics.userGrowth.length) * 100}%`,
                    width: `${100 / analytics.userGrowth.length}%`,
                    height: `${(item.count / Math.max(...analytics.userGrowth.map(i => i.count))) * 100}%`,
                  }}
                >
                  <div className="text-xs text-white text-center mt-2">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-4">
            {analytics.userGrowth.map(item => (
              <div key={item.month} className="text-sm text-gray-600">
                {item.month}
              </div>
            ))}
          </div>
        </div>

        {/* Popular Halls Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Top Performing Halls</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Hall Name</th>
                  <th className="text-right py-2">Bookings</th>
                  <th className="text-right py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.popularHalls.map(hall => (
                  <tr key={hall._id} className="border-b">
                    <td className="py-2">{hall.name}</td>
                    <td className="text-right">{hall.bookingsCount}</td>
                    <td className="text-right">₹{hall.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 
 