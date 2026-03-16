'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CalendarIcon, 
  UserIcon, 
  BuildingOfficeIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  ChevronRightIcon
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
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'pending_approval' | 'cancellation_requested' | 'pending_advance' | 'waiting_owner_confirmation';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  pendingChange?: {
    type: 'reschedule' | 'cancel';
    startDate?: string;
    endDate?: string;
    requestedAt?: string;
  };
}

export default function AdminBookings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchBookings();
    }
  }, [session, status, router]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update booking status');
      const data = await res.json();
      setBookings(bookings.map(booking => booking._id === bookingId ? data.booking : booking));
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  const handlePaymentStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update payment status');
      const data = await res.json();
      setBookings(bookings.map(booking => booking._id === bookingId ? data.booking : booking));
    } catch (err) {
      setError('Failed to update payment status');
    }
  };

  const handleOwnerAction = async (bookingId: string, action: 'approve' | 'reject') => {
    setActionLoading(bookingId + action);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/owner-action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update booking');
      setBookings(bookings.map(b => b._id === bookingId ? data.booking : b));
    } catch (err) {
      setError('Failed to update booking');
    } finally {
      setActionLoading(null);
    }
  };

  const openChat = async (booking: Booking) => {
    setChatBooking(booking);
    setShowChat(true);
    setChatLoading(true);
    try {
      const res = await fetch(`/api/messages?bookingId=${booking._id}`);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!chatBooking || !newMessage.trim()) return;
    setChatLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: chatBooking._id, message: newMessage }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages([...messages, data.message]);
        setNewMessage('');
      }
    } finally {
      setChatLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
    const matchesPayment = selectedPaymentStatus === 'all' || booking.paymentStatus === selectedPaymentStatus;
    const matchesSearch = 
      (booking.hallId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesPayment && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89B3C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and manage venue reservations and payment statuses.</p>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by venue or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C] transition-all text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 sm:flex-none">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C] transition-all text-sm appearance-none bg-white min-w-[160px]"
              >
                <option value="all">All Statuses</option>
                <option value="pending_advance">Pending Advance</option>
                <option value="waiting_owner_confirmation">Waiting Confirmation</option>
                <option value="owner_confirmed">Owner Confirmed</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="relative flex-1 sm:flex-none">
              <CurrencyRupeeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C] transition-all text-sm appearance-none bg-white min-w-[180px]"
              >
                <option value="all">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table/Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Venue & Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Customer</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                        {booking.hallId?.images?.[0] ? (
                          <Image src={booking.hallId.images[0]} alt="" fill className="object-cover" />
                        ) : (
                          <BuildingOfficeIcon className="w-6 h-6 m-3 text-gray-300" />
                        )}
                      </div>
                      <div>
                        {booking.hallId ? (
                          <Link href={`/admin/halls/${booking.hallId._id}`} className="text-sm font-bold text-gray-900 hover:text-[#C89B3C] transition-colors">{booking.hallId.name}</Link>
                        ) : (
                          <span className="text-sm font-bold text-gray-400">Deleted Venue</span>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 font-medium">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                        {booking.userId?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-none">{booking.userId?.name || 'Deleted User'}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{booking.userId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900 leading-none">₹{booking.totalPrice.toLocaleString()}</p>
                    <button 
                      onClick={() => handlePaymentStatusChange(booking._id, booking.paymentStatus === 'paid' ? 'pending' : 'paid')}
                      className={`mt-1.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        booking.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {booking.paymentStatus}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border-0 focus:ring-2 focus:ring-[#C89B3C]/20 cursor-pointer ${
                      booking.status === 'confirmed' ? 'bg-blue-50 text-blue-600' : 
                      booking.status === 'completed' ? 'bg-green-50 text-green-600' : 
                      booking.status === 'cancelled' ? 'bg-red-50 text-red-600' : 
                      booking.status === 'waiting_owner_confirmation' ? 'bg-amber-50 text-amber-600' :
                      booking.status === 'pending_advance' ? 'bg-purple-50 text-purple-600' :
                      'bg-gray-50 text-gray-600'
                    }`}
                    >
                      <option value="pending_advance">Pending Advance</option>
                      <option value="waiting_owner_confirmation">Waiting Confirmation</option>
                      <option value="owner_confirmed">Owner Confirmed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    {(booking.status === 'pending_approval' || booking.status === 'cancellation_requested') && (
                       <div className="mt-2 flex gap-1">
                          <button 
                            onClick={() => handleOwnerAction(booking._id, 'approve')} 
                            className="p-1 hover:bg-green-50 text-green-600 rounded-md transition-colors"
                            title={booking.status === 'cancellation_requested' ? "Approve Cancellation" : "Approve Booking"}
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOwnerAction(booking._id, 'reject')} 
                            className="p-1 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                            title={booking.status === 'cancellation_requested' ? "Reject Cancellation" : "Reject Booking"}
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                       </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => openChat(booking)} title="Chat Support" className="p-2 text-gray-400 hover:text-[#C89B3C] hover:bg-[#C89B3C]/5 rounded-xl transition-all">
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                       </button>
                       <Link href={`/admin/bookings/${booking._id}`} title="View Details" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all">
                          <EyeIcon className="w-5 h-5" />
                       </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="text-center py-20">
              <ClockIcon className="w-12 h-12 text-gray-200 mx-auto" />
              <p className="text-gray-400 font-medium mt-4">No bookings found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      <Transition show={showChat} as={Fragment}>
        <Dialog as="div" className="fixed z-50 inset-0 overflow-y-auto" onClose={() => setShowChat(false)}>
          <div className="flex items-center justify-center min-h-screen px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" aria-hidden="true" />
            </Transition.Child>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 text-[#C89B3C]" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-base font-bold text-gray-900 leading-none">Support Chat</Dialog.Title>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Booking: #{chatBooking?._id.slice(-6)}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowChat(false)} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all">
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="p-6">
                  {chatBooking && (
                    <div className="mb-6 p-4 rounded-2xl bg-gray-50 flex items-start gap-4 border border-gray-100">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                         {chatBooking.hallId?.images?.[0] ? (
                            <Image src={chatBooking.hallId.images[0]} alt="" fill className="object-cover" />
                         ) : (
                            <BuildingOfficeIcon className="w-6 h-6 m-3 text-gray-200" />
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer</p>
                         <p className="text-sm font-bold text-gray-900 truncate">{chatBooking.userId?.name}</p>
                         <p className="text-[10px] text-gray-500 font-medium truncate">{chatBooking.userId?.email}</p>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-gray-300 mt-5" />
                    </div>
                  )}

                  <div className="h-80 overflow-y-auto pr-2 mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
                    {chatLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <ArrowPathIcon className="w-6 h-6 text-[#C89B3C] animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                           <ChatBubbleOvalLeftIcon className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-gray-400 text-xs font-medium">No messages in this thread yet.</p>
                      </div>
                    ) : (
                      messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs font-medium shadow-sm ${
                            msg.sender === 'admin' 
                              ? 'bg-[#C89B3C] text-white rounded-tr-none' 
                              : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                          }`}>
                            {msg.text || msg.message}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/20 focus:border-[#C89B3C] text-xs transition-all"
                      disabled={chatLoading}
                      onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={chatLoading || !newMessage.trim()}
                      className="p-2.5 bg-[#C89B3C] text-white rounded-xl hover:bg-[#B38A34] transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
                    >
                      {chatLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />}
                    </button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

// Missing Icons needed for compilation
import { 
  PaperAirplaneIcon, 
  ChatBubbleOvalLeftIcon, 
  ArrowPathIcon,
  XMarkIcon 
} from '@heroicons/react/24/solid';