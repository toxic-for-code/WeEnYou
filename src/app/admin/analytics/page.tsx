'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  BanknotesIcon,
  CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon
} from '@heroicons/react/24/outline';

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
  const [timeframe, setTimeframe] = useState('month');

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89B3C]"></div>
      </div>
    );
  }

  if (error) return <div className="p-8 bg-red-50 text-red-600 rounded-2xl border border-red-100">{error}</div>;
  if (!analytics) return <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest text-xs">No analytics data available.</div>;

  const stats = [
    { label: 'Total Revenue', value: `₹${analytics.totalRevenue.toLocaleString()}`, icon: BanknotesIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Bookings', value: analytics.totalBookings, icon: CalendarIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Platform Users', value: analytics.totalUsers, icon: UsersIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Total Venues', value: analytics.totalHalls, icon: BuildingOfficeIcon, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Insights</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time platform performance and growth metrics.</p>
        </div>
        <div className="relative">
           <select
             value={timeframe}
             onChange={(e) => setTimeframe(e.target.value)}
             className="appearance-none bg-white border border-gray-100 rounded-xl pl-4 pr-10 py-2.5 text-xs font-bold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50 cursor-pointer"
           >
             <option value="month">Last 30 Days</option>
             <option value="quarter">Last Quarter</option>
             <option value="year">Last 12 Months</option>
           </select>
           <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 transition-all hover:shadow-md">
            <div className={`p-3 rounded-2xl ${stat.bg}`}>
               <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
               <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-4 h-4 text-[#C89B3C]" />
                Revenue Performance
             </h3>
             <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">+12% vs Prev</span>
          </div>
          <div className="h-64 flex items-end gap-2 px-2">
            {analytics.revenueByMonth.map((item, index) => {
              const maxVal = Math.max(...analytics.revenueByMonth.map(i => i.revenue)) || 1;
              const height = (item.revenue / maxVal) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                  <div 
                    className="w-full bg-gray-50 group-hover:bg-gold/10 rounded-t-lg transition-all duration-300 relative overflow-hidden"
                    style={{ height: `${height}%` }}
                  >
                     <div className="absolute inset-x-0 top-0 h-1 bg-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-10">
                     ₹{item.revenue.toLocaleString()}
                  </div>
                  <span className="text-[8px] font-bold text-gray-400 mt-3 uppercase">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-8">
              <ChartBarIcon className="w-4 h-4 text-[#C89B3C]" />
              Booking Status Share
           </h3>
           <div className="space-y-6">
              {analytics.bookingsByStatus.map((item, idx) => {
                 const total = analytics.bookingsByStatus.reduce((acc, curr) => acc + curr.count, 0) || 1;
                 const percent = (item.count / total) * 100;
                 const colors: Record<string, string> = {
                    confirmed: 'bg-green-500',
                    cancelled: 'bg-red-500',
                    completed: 'bg-blue-500',
                    pending: 'bg-amber-500'
                 };
                 return (
                    <div key={idx} className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          <span>{item.status}</span>
                          <span>{item.count} ({percent.toFixed(0)}%)</span>
                       </div>
                       <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${colors[item.status] || 'bg-gray-400'} transition-all duration-1000`} 
                            style={{ width: `${percent}%` }}
                          />
                       </div>
                    </div>
                 );
              })}
           </div>
        </div>

        {/* User Growth */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-8">
             <UsersIcon className="w-4 h-4 text-[#C89B3C]" />
             User Acquisition Growth
          </h3>
          <div className="h-64 flex items-end gap-2 px-2">
            {analytics.userGrowth.map((item, index) => {
              const maxVal = Math.max(...analytics.userGrowth.map(i => i.count)) || 1;
              const height = (item.count / maxVal) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                  <div 
                    className="w-full bg-[#1A1C21] group-hover:bg-[#C89B3C] rounded-t-lg transition-all duration-300"
                    style={{ height: `${height}%` }}
                  />
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap z-10">
                     {item.count} New Users
                  </div>
                  <span className="text-[8px] font-bold text-gray-400 mt-3 uppercase">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
           <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-6">
              <SparklesIcon className="w-4 h-4 text-[#C89B3C]" />
              Top Performing Venues
           </h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-gray-50">
                    <th className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Venue Details</th>
                    <th className="py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bookings</th>
                    <th className="py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {analytics.popularHalls.map((hall, idx) => (
                   <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                     <td className="py-4">
                        <p className="text-xs font-bold text-gray-900 group-hover:text-[#C89B3C] transition-colors">{hall.name}</p>
                     </td>
                     <td className="py-4 text-right">
                        <span className="text-xs font-bold text-gray-700">{hall.bookingsCount}</span>
                     </td>
                     <td className="py-4 text-right">
                        <span className="text-xs font-bold text-[#C89B3C]">₹{hall.revenue.toLocaleString()}</span>
                     </td>
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

import { SparklesIcon } from '@heroicons/react/24/outline';