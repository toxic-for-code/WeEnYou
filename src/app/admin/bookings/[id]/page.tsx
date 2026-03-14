'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  CalendarIcon, 
  MapPinIcon, 
  BanknotesIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  ChevronLeftIcon,
  BuildingOfficeIcon,
  UserIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

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

export default function AdminBookingDetails({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchBookingDetails();
    }
  }, [session, status, router, params.id]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`);
      const data = await response.json();
      setBooking(data.booking);
    } catch (error) {
      console.error('Error fetching booking details:', error);
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

  if (!booking) {
    return (
      <div className="text-center py-20">
         <ExclamationTriangleIcon className="w-12 h-12 text-gray-200 mx-auto" />
         <p className="text-gray-400 font-medium mt-4">Booking not found.</p>
         <Link href="/admin/bookings" className="text-[#C89B3C] font-bold mt-2 inline-block">Back to Bookings</Link>
      </div>
    );
  }

  const eventTitle = `Event Hall Booking: ${booking.hallId.name}`;
  const eventLocation = `${booking.hallId.location.city}, ${booking.hallId.location.state}`;
  const eventDescription = `Booking ID: ${booking._id}`;
  const startISO = new Date(booking.startDate).toISOString().replace(/[-:]|\.\d{3}/g, '');
  const endISO = new Date(booking.endDate).toISOString().replace(/[-:]|\.\d{3}/g, '');
  
  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startISO}/${endISO}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(eventLocation)}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventTitle)}&body=${encodeURIComponent(eventDescription)}&startdt=${booking.startDate}&enddt=${booking.endDate}&location=${encodeURIComponent(eventLocation)}`;
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/bookings" className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-gray-900 shadow-sm transition-all">
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
             <span>Admin</span>
             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
             <span>Bookings</span>
             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
             <span className="text-[#C89B3C]">#{booking._id.slice(-6)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group">
              <div className="relative h-56">
                <Image
                  src={booking.hallId.images?.[0] || '/placeholder.jpg'}
                  alt={booking.hallId.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                   <h3 className="text-xl font-bold text-white leading-tight">{booking.hallId.name}</h3>
                   <div className="flex items-center gap-1.5 text-white/80 text-xs mt-1">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      {booking.hallId.location.city}, {booking.hallId.location.state}
                   </div>
                </div>
              </div>
              <div className="p-6">
                 <Link href={`/admin/halls/${booking.hallId._id}`} className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl text-xs font-bold transition-all border border-gray-100">
                    View Venue Details
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                 </Link>
              </div>
           </div>

           <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <UserIcon className="w-3 h-3" />
                Customer Info
              </h4>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-lg font-bold text-[#C89B3C]">
                    {session?.user?.name?.charAt(0) || 'C'}
                 </div>
                 <div>
                    <p className="font-bold text-gray-900 leading-none">{session?.user?.name || 'Customer Name'}</p>
                    <p className="text-xs text-gray-500 mt-1">{session?.user?.email || 'customer@email.com'}</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-50">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amount</p>
                    <p className="text-3xl font-bold text-gray-900">₹{booking.totalPrice.toLocaleString()}</p>
                 </div>
                 <div className="flex gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                       booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                       booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                       'bg-gray-100 text-gray-700'
                    }`}>
                       {booking.status}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                       booking.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                       {booking.paymentStatus}
                    </span>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-gray-50 rounded-2xl">
                          <CalendarDaysIcon className="w-6 h-6 text-gray-400" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">
                             {new Date(booking.startDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                             <span className="mx-2 text-gray-300">→</span>
                             {new Date(booking.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-gray-50 rounded-2xl">
                          <ClockIcon className="w-6 h-6 text-gray-400" />
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created At</p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">
                             {new Date(booking.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 self-start">
                    <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <CalendarIcon className="w-3 h-3" />
                       Add to Calendar
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                       <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-700 transition-all shadow-sm">
                          Google
                       </a>
                       <a href={outlookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-700 transition-all shadow-sm">
                          Outlook
                       </a>
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-50">
                 <div className="flex gap-4">
                    <button className="flex-1 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-[#C89B3C] transition-all shadow-xl shadow-gray-900/10 active:scale-[0.98]">
                       Approve Booking
                    </button>
                    <button className="flex-1 py-4 bg-white text-red-600 border border-red-50 rounded-2xl text-sm font-bold hover:bg-red-50 transition-all active:scale-[0.98]">
                       Cancel Booking
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';