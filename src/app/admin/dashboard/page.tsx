'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';
import { 
  BuildingOfficeIcon, 
  ClipboardDocumentIcon, 
  UsersIcon, 
  WrenchIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

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

        setHalls(hallsData.halls || []);
        setRecentBookings(bookingsData.bookings || []);
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
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89B3C]"></div>
      </div>
    );
  }

  const totalRevenue = (halls || []).reduce((sum, hall) => sum + (hall.revenue?.total || 0), 0);

  const mainStats = [
    { name: 'Total Halls', value: stats?.totalHalls || 0, icon: BuildingOfficeIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Total Bookings', value: stats?.totalBookings || 0, icon: ClipboardDocumentIcon, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Total Users', value: stats?.totalUsers || 0, icon: UsersIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Total Services', value: stats?.totalServices || 0, icon: WrenchIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {session?.user?.name}. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/halls/new" className="px-4 py-2 bg-[#C89B3C] text-white rounded-xl font-medium hover:bg-[#B38A34] transition-all shadow-lg shadow-gold/20 text-sm">
            Add New Hall
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Alert Panel */}
      {stats?.pendingHalls && stats.pendingHalls > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-amber-900">Pending Approvals</h3>
            <p className="text-sm text-amber-800 mt-0.5">
              There are <span className="font-bold">{stats.pendingHalls} hall(s)</span> waiting for your review.
              {notifications?.hasNewSubmissions && (
                <span className="ml-2 font-medium text-amber-600 italic">New submissions detected!</span>
              )}
            </p>
            <Link
              href="/admin/halls?tab=pending"
              className="mt-3 inline-flex items-center text-sm font-bold text-amber-900 hover:underline"
            >
              Review pending halls now →
            </Link>
          </div>
        </div>
      )}

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Submissions Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-[#C89B3C]" />
              <h3 className="font-bold text-gray-900">Recent Pending Submissions</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Last 7 Days</span>
          </div>
          <div className="p-6">
            {notifications?.recentPendingHalls && notifications.recentPendingHalls.length > 0 ? (
              <div className="space-y-4">
                {notifications.recentPendingHalls.slice(0, 5).map((hall: any) => (
                  <div key={hall._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                        {hall.images?.[0] ? (
                          <Image src={hall.images[0]} alt={hall.name} width={40} height={40} className="object-cover h-full" />
                        ) : (
                          <BuildingOfficeIcon className="w-5 h-5 m-2.5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-none group-hover:text-[#C89B3C] transition-colors">{hall.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Submitted by {hall.ownerId?.name || 'Unknown'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-400">
                      {new Date(hall.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <InformationCircleIcon className="w-10 h-10 text-gray-200 mx-auto" />
                <p className="text-gray-400 text-sm mt-2 font-medium">No recent pending submissions</p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Overview Quick Stats */}
        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-2xl shadow-lg border border-white/5 text-white overflow-hidden relative group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#C89B3C]/10 rounded-full blur-3xl group-hover:bg-[#C89B3C]/20 transition-all duration-500"></div>
            <div className="flex items-center gap-3 mb-4">
              <ChartBarIcon className="w-5 h-5 text-[#C89B3C]" />
              <h3 className="font-bold uppercase tracking-widest text-[10px] text-[#C89B3C]">Platform Status</h3>
            </div>
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase">Total Revenue Generated</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#C89B3C] w-3/4 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 text-sm">System Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Pending Verifications</span>
                <span className="font-bold text-gray-900">{stats?.pendingHalls || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-gray-500 font-medium">Active Services</span>
                <span className="font-bold text-gray-900">{stats?.totalServices || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed View Section with Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 border-b border-gray-50">
          <nav className="flex space-x-6">
            {['overview', 'halls', 'bookings', 'support'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 text-sm font-bold capitalize relative transition-all ${
                  activeTab === tab 
                    ? 'text-[#C89B3C]' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C89B3C] rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
              </div>
              <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
              <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">98%</p>
              </div>
            </div>
          )}

          {activeTab === 'halls' && (
            <div className="divide-y divide-gray-100">
              {halls.slice(0, 5).map((hall) => (
                <div key={hall._id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-white">
                      <Image src={getImageUrl(hall.images[0])} alt={hall.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{hall.name}</p>
                      <p className="text-xs text-gray-500">{hall.location?.city}, {hall.location?.state}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{hall.price}/day</p>
                    <Link href={`/admin/halls/${hall._id}`} className="text-[10px] font-bold text-[#C89B3C] uppercase hover:underline">Manage</Link>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <Link href="/admin/halls" className="text-sm font-bold text-[#C89B3C] hover:underline">View all halls →</Link>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="divide-y divide-gray-100">
              {recentBookings.slice(0, 5).map((booking) => (
                <div key={booking._id} className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold border-2 border-white shadow-sm ring-1 ring-gray-100 text-xs">
                      {booking.userId?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-[#C89B3C] transition-colors">{booking.hallId?.name || 'Deleted Hall'}</p>
                      <p className="text-xs text-gray-500">{booking.userId?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{booking.totalPrice}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <Link href="/admin/bookings" className="text-sm font-bold text-[#C89B3C] hover:underline">View all bookings →</Link>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="overflow-x-auto -mx-6">
              <div className="inline-block min-w-full align-middle px-6">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">User</th>
                      <th className="py-4 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Subject</th>
                      <th className="py-4 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {supportRequests.slice(0, 5).map((req) => (
                      <tr key={req._id}>
                        <td className="py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-gray-900">{req.user?.name || 'Guest'}</p>
                          <p className="text-xs text-gray-500">{req.email}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-sm text-gray-600 font-medium line-clamp-1">{req.subject}</p>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-[10px] font-bold text-[#C89B3C] uppercase hover:underline">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}