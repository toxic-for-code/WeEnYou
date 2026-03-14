"use client";
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';
import PlanEvent from '@/models/PlanEvent'; // (for type only, not used directly)

const TABS = ["Upcoming", "Past", "Cancelled"];

// Helper functions for status display
const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'text-green-600';
    case 'cancelled': return 'text-red-600';
    case 'completed': return 'text-blue-600';
    case 'pending_owner_confirmation':
    case 'waiting_owner_confirmation': return 'text-blue-600';
    case 'pending_advance': return 'text-yellow-600';
    case 'pending_approval': return 'text-orange-600';
    default: return 'text-yellow-600';
  }
};

const getStatusDisplayText = (status: string) => {
  switch (status) {
    case 'confirmed': return 'Confirmed';
    case 'cancelled': return 'Cancelled';
    case 'completed': return 'Completed';
    case 'pending_owner_confirmation':
    case 'waiting_owner_confirmation': return 'Pending Confirmation';
    case 'pending_advance': return 'Pending Advance Payment';
    case 'pending_approval': return 'Pending Approval';
    default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending';
  }
};

const getPaymentStatusColor = (paymentStatus: string, advancePaid: boolean) => {
  if (paymentStatus === 'paid') return 'text-green-600';
  if (paymentStatus === 'refunded') return 'text-blue-600';
  if (advancePaid) return 'text-blue-600'; // Advance paid but final payment pending
  return 'text-yellow-600'; // No payment made
};

const getPaymentStatusDisplayText = (paymentStatus: string, advancePaid: boolean) => {
  if (paymentStatus === 'paid') return 'Fully Paid';
  if (paymentStatus === 'refunded') return 'Refunded';
  if (advancePaid) return 'Advance Paid'; // Show that advance is paid
  return 'Pending Payment';
};

export default function ProfilePage() {
  const { data: session } = useSession();
  // Debug log for profile image
  console.log('Profile image:', session?.user?.image);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Upcoming");
  const [showEdit, setShowEdit] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showSupport, setShowSupport] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [plannedEvents, setPlannedEvents] = useState<any[]>([]);
  const [plannedEventsLoading, setPlannedEventsLoading] = useState(true);

  // Placeholder for rewards (notifications moved to Navbar)
  const rewards = { points: 120, tier: "Gold" };

  const [search, setSearch] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic or navigation here
    alert(`Searching for: ${search}, Check-in: ${checkIn}, Check-out: ${checkOut}, Guests: ${guests}`);
  };

  useEffect(() => {
    if (session?.user) {
      fetch('/api/bookings')
        .then(res => res.json())
        .then(data => setBookings(data.bookings || []))
        .finally(() => setLoading(false));
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/plan-event/user-events')
        .then(res => res.json())
        .then(data => setPlannedEvents(data.events || []))
        .finally(() => setPlannedEventsLoading(false));
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/plan-event/user-events')
        .then(res => res.json())
        .then(data => setPlannedEvents(data.events || []))
        .finally(() => setPlannedEventsLoading(false));
    }
  }, [session]);

  if (!session?.user) {
    return (
      <div className="page-mobile-first min-h-screen flex items-center justify-center w-full min-w-0">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
          <Link href="/auth/signin" className="text-primary-600 hover:underline">Sign In</Link>
        </div>
      </div>
    );
  }

  // Booking filtering logic (placeholder)
  const now = new Date();
  const filteredBookings = bookings.filter((b: any) => {
    if (tab === "Upcoming") return new Date(b.startDate) >= now && b.status !== "cancelled";
    if (tab === "Past") return new Date(b.startDate) < now && b.status !== "cancelled";
    if (tab === "Cancelled") return b.status === "cancelled";
    return true;
  });


  // Profile edit form (fully implemented)
  const EditProfileModal = () => {
    const [name, setName] = useState(session.user.name || '');
    const [phone, setPhone] = useState((session.user as any)?.phone || '');
    const [image, setImage] = useState(session.user.image || '');
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
      }
    };

    const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setError('');
      let imageUrl = image;
      try {
        if (file) {
          const formData = new FormData();
          formData.append('files', file);
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.urls && data.urls[0]) imageUrl = data.urls[0];
        }
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, image: imageUrl })
        });
        if (!res.ok) throw new Error('Failed to update profile');
        setShowEdit(false);
        // Optionally, refresh the page or session data
        window.location.reload();
      } catch (err: any) {
        setError(err.message || 'Error updating profile');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
          <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input className="input-field" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium">Profile Picture</label>
              <input type="file" className="input-field" onChange={handleFileChange} />
              {image && <img src={file ? URL.createObjectURL(file) : image} alt="Profile" className="w-16 h-16 rounded-full mt-2" />}
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowEdit(false)} disabled={saving}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Booking details modal (fully implemented)
  const BookingModal = () => {
    const [action, setAction] = useState<'none' | 'reschedule' | 'review'>('none');
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [review, setReview] = useState<{ rating: number; comment: string }>({ rating: 5, comment: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    if (!selectedBooking) return null;

    // Calendar event details
    const eventTitle = `Event Hall Booking: ${selectedBooking.hallName || selectedBooking.hallId?.name}`;
    const eventLocation = `${selectedBooking.hallAddress || selectedBooking.hallId?.location?.address || ''}, ${selectedBooking.hallCity || selectedBooking.hallId?.location?.city || ''}, ${selectedBooking.hallState || selectedBooking.hallId?.location?.state || ''}`;
    const eventDescription = `Booking at ${selectedBooking.hallName || selectedBooking.hallId?.name}\nGuests: ${selectedBooking.guests}\nSpecial Requests: ${selectedBooking.specialRequests || 'None'}`;
    const startISO = selectedBooking.startDate ? new Date(selectedBooking.startDate).toISOString().replace(/[-:]|\.\d{3}/g, '') : '';
    const endISO = selectedBooking.endDate ? new Date(selectedBooking.endDate).toISOString().replace(/[-:]|\.\d{3}/g, '') : '';
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startISO}/${endISO}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(eventLocation)}`;
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventTitle)}&body=${encodeURIComponent(eventDescription)}&startdt=${selectedBooking.startDate}&enddt=${selectedBooking.endDate}&location=${encodeURIComponent(eventLocation)}`;
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${eventTitle}\nDTSTART:${startISO}\nDTEND:${endISO}\nDESCRIPTION:${eventDescription}\nLOCATION:${eventLocation}\nEND:VEVENT\nEND:VCALENDAR`;
    const icsUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

    // Totals (mocked for now)
    const servicesTotal = selectedBooking.servicesTotal || 0;
    const grandTotal = (selectedBooking.totalPrice || 0) + servicesTotal;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
        <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[90vh] overflow-hidden">

          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="text-xl font-black text-gray-900">Booking Details</h2>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[220px]">ID: {selectedBooking._id}</p>
            </div>
            <button
              onClick={() => setShowBookingModal(false)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all active:scale-90"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1">

            {/* Venue Image */}
            <div className="relative w-full h-48 sm:h-56 bg-gray-100 flex-shrink-0">
              <Image
                src={getImageUrl(selectedBooking.hallImage || selectedBooking.hallId?.images?.[0] || '/default-hall.jpg')}
                alt={selectedBooking.hallName || selectedBooking.hallId?.name || 'Event Hall'}
                fill
                className="object-cover"
              />
            </div>

            {/* Venue Information */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900 leading-tight">
                {selectedBooking.hallName || selectedBooking.hallId?.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {[
                  selectedBooking.hallAddress || selectedBooking.hallId?.location?.address,
                  selectedBooking.hallCity || selectedBooking.hallId?.location?.city,
                  selectedBooking.hallState || selectedBooking.hallId?.location?.state,
                ].filter(Boolean).join(', ')}
              </p>

              {/* Amenities */}
              {(selectedBooking.hallAmenities || selectedBooking.hallId?.amenities || []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selectedBooking.hallAmenities || selectedBooking.hallId?.amenities || []).map((amenity: string) => (
                    <span key={amenity} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Booking Information */}
            <div className="px-5 py-4 border-b border-gray-100">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Event Details</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">Check-in</span>
                  <span className="text-sm font-bold text-gray-900">
                    {selectedBooking.startDate ? new Date(selectedBooking.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">Check-out</span>
                  <span className="text-sm font-bold text-gray-900">
                    {selectedBooking.endDate ? new Date(selectedBooking.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">Guests</span>
                  <span className="text-sm font-bold text-gray-900">{selectedBooking.guests || 'N/A'} People</span>
                </div>
              </div>
            </div>

            {/* Status Badges */}
            <div className="px-5 py-4 border-b border-gray-100">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Booking Status</h4>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                    selectedBooking.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : selectedBooking.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {getStatusDisplayText(selectedBooking.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">Payment</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                    selectedBooking.paymentStatus === 'paid' || selectedBooking.advancePaid
                      ? 'bg-green-100 text-green-700'
                      : selectedBooking.paymentStatus === 'failed'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {getPaymentStatusDisplayText(selectedBooking.paymentStatus, selectedBooking.advancePaid)}
                  </span>
                </div>
              </div>
            </div>

            {/* Calendar Links */}
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-bold text-gray-500 uppercase tracking-wider">Add to Calendar:</span>
                <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 font-bold hover:underline">Google</a>
                <a href={outlookUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 font-bold hover:underline">Outlook</a>
                <a href={icsUrl} download={`booking-${selectedBooking._id}.ics`} className="text-primary-600 font-bold hover:underline">iCal</a>
              </div>
            </div>

            {/* Price Summary */}
            <div className="px-5 py-4 border-b border-gray-100">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Price Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Venue Price</span>
                  <span className="font-semibold text-gray-700">₹{selectedBooking.totalPrice || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Services Total</span>
                  <span className="font-semibold text-gray-700">₹{servicesTotal}</span>
                </div>
                <div className="flex justify-between pt-3 mt-2 border-t border-gray-200">
                  <span className="text-base font-black text-gray-900">Grand Total</span>
                  <span className="text-xl font-black text-gray-900">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            {/* Manage Services */}
            <div className="px-5 py-4 border-b border-gray-100 print:hidden">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Manage Services</h4>
              <button className="btn-primary text-sm px-4 py-2 rounded-xl">Add Service</button>
            </div>

            {/* Print Section for invoice */}
            <div className="hidden print:block p-6">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Booking Details</h1>
              <p className="text-gray-600 text-xs mb-2">Booking ID: {selectedBooking._id}</p>
              <div className="flex gap-4 mb-4">
                <div>
                  <img src={selectedBooking.hallImage || selectedBooking.hallId?.images?.[0] || '/default-hall.jpg'} alt="Hall" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }} />
                </div>
                <div>
                  <div className="font-bold text-lg">{selectedBooking.hallName || selectedBooking.hallId?.name}</div>
                  <div className="text-sm text-gray-700">{selectedBooking.hallAddress || selectedBooking.hallId?.location?.address}</div>
                  <div className="text-sm text-gray-700">{selectedBooking.hallCity || selectedBooking.hallId?.location?.city}, {selectedBooking.hallState || selectedBooking.hallId?.location?.state}</div>
                  <div className="mt-2"><span className="font-semibold text-xs">Amenities: </span>{(selectedBooking.hallAmenities || selectedBooking.hallId?.amenities || []).join(', ')}</div>
                </div>
              </div>
              <div className="mb-2"><span className="font-semibold">Check-in:</span> {selectedBooking.startDate ? new Date(selectedBooking.startDate).toLocaleDateString() : 'N/A'} <span className="ml-4 font-semibold">Check-out:</span> {selectedBooking.endDate ? new Date(selectedBooking.endDate).toLocaleDateString() : 'N/A'}</div>
              <div className="mb-2"><span className="font-semibold">Guests:</span> {selectedBooking.guests || 'N/A'} <span className="ml-4 font-semibold">Total:</span> ₹{selectedBooking.totalPrice || 0}</div>
              <div className="mb-2"><span className="font-semibold">Status:</span> {getStatusDisplayText(selectedBooking.status)} <span className="ml-4 font-semibold">Payment:</span> {getPaymentStatusDisplayText(selectedBooking.paymentStatus, selectedBooking.advancePaid)}</div>
              <div className="mb-2"><span className="font-semibold">Services Total:</span> ₹{servicesTotal} <span className="ml-4 font-semibold">Grand Total:</span> ₹{grandTotal}</div>
              <div className="mt-6">
                <h2 className="font-bold text-lg mb-1">Policies</h2>
                <ul className="list-disc ml-6 text-sm text-gray-700">
                  <li>Check-in and check-out times must be strictly followed.</li>
                  <li>Any damage to property will be chargeable.</li>
                  <li>Cancellation and refund policies as per platform terms.</li>
                  <li>Guests must adhere to all local laws and venue rules.</li>
                  <li>For support, contact our help desk or visit the Help page.</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Sticky Action Buttons */}
          <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 flex flex-col gap-3 bg-white print:hidden">
            <button
              className="w-full bg-[#111111] hover:bg-black text-white py-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              onClick={() => window.print()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Download Invoice
            </button>
            <button
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98]"
              onClick={() => setShowBookingModal(false)}
            >
              Close
            </button>
          </div>

        </div>
      </div>
    );
  };

  // Support modal (fully implemented)
  const SupportModal = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSupport = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      setLoading(true);
      try {
        const res = await fetch('/api/support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, message })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to submit request');
        setSuccess('Support request submitted!');
        setSubject('');
        setMessage('');
        setTimeout(() => { setShowSupport(false); setSuccess(''); }, 1500);
      } catch (err: any) {
        setError(err.message || 'Error submitting request');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
          <h3 className="text-xl font-bold mb-4">Contact Support</h3>
          <form className="space-y-4" onSubmit={handleSupport}>
            <div>
              <label className="block text-sm font-medium">Subject</label>
              <input className="input-field" value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Message</label>
              <textarea className="input-field" value={message} onChange={e => setMessage(e.target.value)} required />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowSupport(false)} disabled={loading}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Change Password modal
  const ChangePasswordModal = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      setLoading(true);
      try {
        const res = await fetch('/api/profile/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to change password');
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } catch (err: any) {
        setError(err.message || 'Error changing password');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
          <h3 className="text-xl font-bold mb-4">Change Password</h3>
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div>
              <label className="block text-sm font-medium">Current Password</label>
              <input type="password" className="input-field" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium">New Password</label>
              <input type="password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Confirm New Password</label>
              <input type="password" className="input-field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <div className="flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowChangePassword(false)} disabled={loading}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Change Password'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Two-Factor Authentication modal (placeholder)
  const TwoFAModal = () => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
        <h3 className="text-xl font-bold mb-4">Two-Factor Authentication</h3>
        <div className="mb-4">This feature is coming soon! For now, please contact support to enable 2FA on your account.</div>
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary" onClick={() => setShow2FA(false)}>Close</button>
        </div>
      </div>
    </div>
  );

  // Cancel Reason Modal
  const CancelReasonModal = () => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
        <h3 className="text-xl font-bold mb-4">Cancel Booking</h3>
        <div className="mb-4">Why do you want to cancel?</div>
        <textarea
          className="input-field mb-4"
          placeholder="Optional: Let us know the reason for cancellation"
          value={cancelReason}
          onChange={e => setCancelReason(e.target.value)}
          rows={3}
        />
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary" onClick={() => { setShowCancelReason(false); setCancelReason(''); setCancelBookingId(null); }}>Close</button>
          <button className="btn-secondary" onClick={() => { setShowCancelReason(false); setCancelReason(''); handleCancelBooking(''); }}>Skip</button>
          <button className="btn-primary" onClick={() => { setShowCancelReason(false); handleCancelBooking(cancelReason); }}>Cancel Booking</button>
        </div>
      </div>
    </div>
  );

  // Reschedule Modal
  const RescheduleModal = () => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-lg">
        <h3 className="text-xl font-bold mb-4">Reschedule Booking</h3>
        <div className="mb-4">Select a new start date for your booking:</div>
        <input
          type="date"
          className="input-field mb-4"
          value={rescheduleDate}
          onChange={e => setRescheduleDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
        />
        <div className="flex gap-2 justify-end">
          <button className="btn-secondary" onClick={() => { setShowReschedule(false); setRescheduleDate(''); setRescheduleBookingId(null); }}>Close</button>
          <button className="btn-primary" onClick={async () => {
            if (!rescheduleBookingId || !rescheduleDate) return;
            try {
              const res = await fetch(`/api/bookings/${rescheduleBookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ startDate: rescheduleDate })
              });
              if (!res.ok) throw new Error('Failed to request reschedule');
              window.location.reload();
            } catch (err) {
              alert('Error requesting reschedule');
            } finally {
              setShowReschedule(false);
              setRescheduleDate('');
              setRescheduleBookingId(null);
            }
          }}>Submit Request</button>
        </div>
      </div>
    </div>
  );

  // Handler to call API for cancellation
  const handleCancelBooking = async (reason: string) => {
    if (!cancelBookingId) return;
    try {
      const res = await fetch(`/api/bookings/${cancelBookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) throw new Error('Failed to cancel booking');
      window.location.reload();
    } catch (err) {
      alert('Error cancelling booking');
    } finally {
      setCancelReason('');
      setCancelBookingId(null);
    }
  };

  return (
    <div className="page-mobile-first min-h-screen bg-gray-50 w-full min-w-0 overflow-x-hidden">
      {/* Main Profile Content */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          {/* Profile Header Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>
            
            <div className="relative group flex-shrink-0">
              <div className="w-32 h-32 rounded-full ring-4 ring-primary-50 overflow-hidden shadow-inner bg-gray-100 flex items-center justify-center text-5xl font-black text-primary-700">
                {session.user.image ? (
                  <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{session.user.name?.[0] || session.user.email?.[0] || 'U'}</span>
                )}
              </div>
              <button 
                onClick={() => setShowEdit(true)}
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-100 hover:bg-primary-50 transition-all active:scale-90"
              >
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h2 className="text-3xl font-black text-gray-900 leading-tight">
                  {session.user.name || "User Name"}
                </h2>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2">
                  <span className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-medium text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {session.user.email}
                  </span>
                  {(session.user as any).phone && (
                    <span className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-medium text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {(session.user as any).phone}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 pt-2">
                <button 
                  className="bg-[#111111] hover:bg-black text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-gray-900/10 transition-all active:scale-95 flex items-center gap-2"
                  onClick={() => setShowEdit(true)}
                >
                  Edit Profile Information
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Tabs for Bookings */}
        <div className="mb-8">
          <div className="inline-flex p-1 bg-gray-100 rounded-2xl w-full sm:w-auto">
            {TABS.map(t => (
              <button
                key={t}
                className={`flex-1 sm:flex-none py-3 px-8 rounded-xl font-black text-sm transition-all duration-300 ${
                  tab === t 
                    ? 'bg-white text-gray-900 shadow-lg shadow-gray-200/50 scale-[1.02]' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="mb-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse">
                  <div className="w-full h-48 bg-gray-100 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-gray-100 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center flex flex-col items-center gap-4">
              <div className="p-4 bg-gray-50 text-gray-300 rounded-full">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No {tab.toLowerCase()} bookings found</p>
              <Link href="/halls" className="text-primary-600 font-black text-sm hover:underline">Explore Venues →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredBookings.map((b: any) => (
                <div 
                  key={b._id} 
                  className="group bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden flex flex-col transition-all hover:shadow-2xl hover:shadow-primary-600/5 cursor-pointer"
                >
                  {/* Card Header/Image */}
                  <div className="relative h-56 overflow-hidden">
                    {b.hallId?.images?.[0] ? (
                      <img src={b.hallId.images[0]} alt={b.hallId.name || 'Venue'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                        b.status === 'confirmed' ? 'bg-green-500 text-white' : 
                        b.status === 'cancelled' ? 'bg-red-500 text-white' : 
                        'bg-yellow-400 text-gray-900'
                      }`}>
                        {getStatusDisplayText(b.status)}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h4 className="text-xl font-black text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                        {b.hallId?.name || 'Event Hall'}
                      </h4>
                      <p className="text-gray-500 text-xs font-bold flex items-center gap-1 mb-4 uppercase tracking-tighter">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {b.hallId?.location?.city || 'Location'}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-gray-50 rounded-2xl flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Date</span>
                            <span className="text-xs font-black text-gray-900">{b.startDate ? new Date(b.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-2xl flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg text-gray-400 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Guests</span>
                            <span className="text-xs font-black text-gray-900">{b.guests || 0} People</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      <Link
                        href={`/bookings/${b._id}`}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2.5 rounded-xl font-black text-xs transition-all active:scale-95 text-center"
                        onClick={e => e.stopPropagation()}
                      >
                        View Details
                      </Link>
                      {tab === 'Upcoming' && (
                        <>
                          <button 
                            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-primary-500/10 transition-all active:scale-95"
                            onClick={e => { e.stopPropagation(); setShowReschedule(true); setRescheduleBookingId(b._id); }}
                          >
                            Reschedule
                          </button>
                          <button 
                            className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl font-black text-xs border border-red-100 transition-all active:scale-95"
                            onClick={e => { e.stopPropagation(); setCancelBookingId(b._id); setShowCancelReason(true); }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {tab === 'Past' && (
                        <button 
                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-lg shadow-primary-500/10 transition-all active:scale-95"
                          onClick={e => { e.stopPropagation(); /* Review link */ }}
                        >
                          Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security & Support Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Security Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform"></div>
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="p-2 bg-red-50 text-red-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              Security
            </h3>
            <div className="space-y-4">
              <button 
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-100 py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-between transition-all group/btn"
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
                <svg className="w-4 h-4 text-gray-300 group-hover/btn:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button 
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-100 py-4 px-6 rounded-2xl font-black text-sm flex items-center justify-between transition-all group/btn"
                onClick={() => setShow2FA(true)}
              >
                Two-Factor Authentication
                <span className="bg-primary-50 text-primary-600 text-[8px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Coming Soon</span>
              </button>
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full -mr-12 -mt-12 opacity-50 group-hover:scale-110 transition-transform"></div>
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <span className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              Support Center
            </h3>
            <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
              Facing issues or have questions? Our support team is here to help you 24/7.
            </p>
            <button 
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 px-6 rounded-2xl font-black text-sm shadow-xl shadow-primary-500/10 transition-all active:scale-95 flex items-center justify-center gap-2"
              onClick={() => setShowSupport(true)}
            >
              Contact Support Team
            </button>
          </div>
        </div>

        {/* My Planned Events Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
              <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </span>
              Planned Events
            </h2>
            <Link href="/plan-event" className="text-primary-600 font-extrabold text-xs uppercase tracking-widest hover:underline">
              Plan New Event +
            </Link>
          </div>

          {plannedEventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse h-40"></div>
              ))}
            </div>
          ) : plannedEvents.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center flex flex-col items-center gap-4">
               <div className="p-4 bg-purple-50 text-purple-300 rounded-full">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No planned events found</p>
              <Link href="/plan-event" className="text-purple-600 font-black text-sm hover:underline">Start Planning →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plannedEvents.map(ev => (
                <div key={ev._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:shadow-purple-600/5 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {ev.eventType}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      ev.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {ev.status || 'Active'}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-black text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                    {ev.city} Celebration
                  </h4>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-bold">{ev.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-xs font-bold">{ev.guests} Guests</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                        {ev.eventManagerName || 'Manager Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEdit && <EditProfileModal />}
      {showBookingModal && <BookingModal />}
      {showSupport && <SupportModal />}
      {showChangePassword && <ChangePasswordModal />}
      {show2FA && <TwoFAModal />}
        {showCancelReason && <CancelReasonModal />}
        {showReschedule && <RescheduleModal />}
    </div>
  );
}