'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';

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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'pending_approval';
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
      setBookings(data.bookings);
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
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? data.booking : booking
      ));
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
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? data.booking : booking
      ));
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
      (booking.hallId && booking.hallId.name && booking.hallId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.userId && booking.userId.name && booking.userId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.userId && booking.userId.email && booking.userId.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesPayment && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'refunded': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Bookings</h1>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by hall name, user name, or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={selectedPaymentStatus}
          onChange={(e) => setSelectedPaymentStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Payment Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="grid gap-6">
        {filteredBookings.map((booking) => (
          <div key={booking._id} className={`bg-white p-6 rounded-lg shadow-md ${booking.status === 'pending_approval' ? 'border-2 border-yellow-500' : ''}`}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/4">
                {booking.hallId && booking.hallId.images && booking.hallId.images[0] && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={booking.hallId.images[0]}
                      alt={booking.hallId.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    {booking.hallId && booking.hallId._id ? (
                      <Link 
                        href={`/admin/halls/${booking.hallId._id}`}
                        className="text-xl font-semibold hover:text-blue-600"
                      >
                        {booking.hallId.name}
                      </Link>
                    ) : (
                      <span className="text-xl font-semibold text-gray-400">Hall deleted</span>
                    )}
                    <p className="text-gray-600">
                      {booking.hallId && booking.hallId.location && booking.hallId.location.city && booking.hallId.location.state
                        ? `${booking.hallId.location.city}, ${booking.hallId.location.state}`
                        : 'Location unavailable'}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">₹{booking.totalPrice}</p>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold">Customer Information</h3>
                  <p>{booking.userId && booking.userId.name ? booking.userId.name : 'User deleted'}{booking.userId && booking.userId.email ? ` (${booking.userId.email})` : ''}</p>
                  {booking.userId && booking.userId.phone && <p>{booking.userId.phone}</p>}
                </div>

                <div className="mt-4">
                  <p>Start Date: {new Date(booking.startDate).toLocaleDateString()}</p>
                  <p>End Date: {new Date(booking.endDate).toLocaleDateString()}</p>
                  <p>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</p>
                </div>

                {/* Pending Approval Actions */}
                {booking.status === 'pending_approval' && booking.pendingChange && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-400 rounded">
                    <h4 className="font-semibold text-yellow-800 mb-2">Pending {booking.pendingChange.type === 'reschedule' ? 'Reschedule' : 'Cancellation'} Request</h4>
                    {booking.pendingChange.type === 'reschedule' && (
                      <div className="mb-2">
                        <p>Requested New Start: <span className="font-medium">{booking.pendingChange.startDate ? new Date(booking.pendingChange.startDate).toLocaleDateString() : ''}</span></p>
                        <p>Requested New End: <span className="font-medium">{booking.pendingChange.endDate ? new Date(booking.pendingChange.endDate).toLocaleDateString() : ''}</span></p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleOwnerAction(booking._id, 'approve')}
                        disabled={actionLoading === booking._id + 'approve'}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === booking._id + 'approve' ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleOwnerAction(booking._id, 'reject')}
                        disabled={actionLoading === booking._id + 'reject'}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading === booking._id + 'reject' ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-4">
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                    className={`px-3 py-1 rounded ${getStatusColor(booking.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>

                  <select
                    value={booking.paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(booking._id, e.target.value)}
                    className={`px-3 py-1 rounded ${getPaymentStatusColor(booking.paymentStatus)}`}
                  >
                    <option value="pending">Payment Pending</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>

                  <Link
                    href={`/admin/bookings/${booking._id}`}
                    className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                </div>

                {/* Chat Button */}
                <div className="mt-4">
                  <button
                    onClick={() => openChat(booking)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Messages
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Modal */}
      <Dialog open={showChat} onClose={() => setShowChat(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 z-10">
            <Dialog.Title className="text-lg font-bold mb-4">Messages</Dialog.Title>
            {chatBooking && (
              <div className="mb-2 text-sm text-gray-700">
                <div>Hall: <b>{chatBooking.hallId && chatBooking.hallId.name ? chatBooking.hallId.name : 'Hall deleted'}</b></div>
                <div>User: <b>{chatBooking.userId && chatBooking.userId.name ? chatBooking.userId.name : 'User deleted'}{chatBooking.userId && chatBooking.userId.email ? ` (${chatBooking.userId.email})` : ''}</b></div>
              </div>
            )}
            <div className="h-64 overflow-y-auto border rounded p-2 bg-gray-50 mb-2">
              {chatLoading ? (
                <div>Loading...</div>
              ) : messages.length === 0 ? (
                <div className="text-gray-400">No messages yet.</div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`mb-2 ${msg.sender === 'owner' ? 'text-right' : 'text-left'}`}> {/* Adjust sender logic as needed */}
                    <span className={`inline-block px-3 py-1 rounded ${msg.sender === 'owner' ? 'bg-blue-200' : 'bg-gray-200'}`}>{msg.text || msg.message}</span>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="flex-1 border rounded px-2 py-1"
                placeholder="Type a message..."
                disabled={chatLoading}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              />
              <button
                onClick={sendMessage}
                disabled={chatLoading || !newMessage.trim()}
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 w-full"
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
} 
 