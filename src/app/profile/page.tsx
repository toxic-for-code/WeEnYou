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
    case 'pending_owner_confirmation': return 'text-blue-600';
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
    case 'pending_owner_confirmation': return 'Awaiting Owner Confirmation';
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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Upcoming");
  const [showEdit, setShowEdit] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showSupport, setShowSupport] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState('');
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null);
  const [plannedEvents, setPlannedEvents] = useState([]);
  const [plannedEventsLoading, setPlannedEventsLoading] = useState(true);

  // Placeholder for notifications, rewards (recommendations removed)
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
      setNotifLoading(true);
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => setNotifications(data.notifications || []))
        .catch(() => setNotifError('Failed to load notifications.'))
        .finally(() => setNotifLoading(false));
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
      <div className="min-h-screen flex items-center justify-center">
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

  const markNotificationRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id })
    });
    setNotifications(notifications => notifications.map(n => n._id === id ? { ...n, read: true } : n));
  };

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
    const [review, setReview] = useState({ rating: 5, comment: '' });
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
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
        <div className="bg-white rounded-2xl p-0 w-full max-w-lg shadow-2xl border border-gray-200">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Booking Details</h1>
              <p className="text-gray-500 mt-1 text-xs">Booking ID: {selectedBooking._id}</p>
            </div>
          </div>

          {/* Print Section (hidden on screen, visible on print) */}
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
                <div className="mt-2">
                  <span className="font-semibold text-xs">Amenities: </span>
                  {(selectedBooking.hallAmenities || selectedBooking.hallId?.amenities || []).join(', ')}
                </div>
              </div>
            </div>
            <div className="mb-2">
              <span className="font-semibold">Check-in:</span> {selectedBooking.startDate ? new Date(selectedBooking.startDate).toLocaleDateString() : 'N/A'}
              <span className="ml-4 font-semibold">Check-out:</span> {selectedBooking.endDate ? new Date(selectedBooking.endDate).toLocaleDateString() : 'N/A'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Guests:</span> {selectedBooking.guests || 'N/A'}
              <span className="ml-4 font-semibold">Total:</span> ₹{selectedBooking.totalPrice || 0}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Status:</span> {getStatusDisplayText(selectedBooking.status)}
              <span className="ml-4 font-semibold">Payment:</span> {getPaymentStatusDisplayText(selectedBooking.paymentStatus, selectedBooking.advancePaid)}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Services Total:</span> ₹{servicesTotal}
              <span className="ml-4 font-semibold">Grand Total:</span> ₹{grandTotal}
            </div>
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

          {/* Hall Details + Booking Info Side by Side (screen only) */}
          <div className="flex flex-col md:flex-row gap-4 p-4 pb-2 print:hidden">
            {/* Hall Details */}
            <div className="flex-shrink-0 w-full md:w-40 flex flex-col items-center">
              <div className="relative w-28 h-28 md:w-32 md:h-32 mb-2 rounded-xl overflow-hidden shadow-md">
                <Image
                  src={getImageUrl(selectedBooking.hallImage || selectedBooking.hallId?.images?.[0] || '/default-hall.jpg')}
                  alt={selectedBooking.hallName || selectedBooking.hallId?.name || 'Event Hall'}
                  fill
                  className="object-cover"
                />
              </div>
              <h2 className="text-base font-bold text-gray-900 text-center mb-1 mt-1">{selectedBooking.hallName || selectedBooking.hallId?.name}</h2>
              <p className="text-xs text-gray-500 text-center mb-1">{selectedBooking.hallAddress || selectedBooking.hallId?.location?.address}</p>
              <p className="text-xs text-gray-500 text-center mb-1">{selectedBooking.hallCity || selectedBooking.hallId?.location?.city}, {selectedBooking.hallState || selectedBooking.hallId?.location?.state}</p>
              <div className="mt-2 w-full">
                <h3 className="font-semibold text-xs text-gray-800 mb-1">Amenities</h3>
                <div className="flex flex-nowrap overflow-x-auto gap-2 px-1 py-2 bg-gray-50 rounded-lg border border-gray-100">
                  {(selectedBooking.hallAmenities || selectedBooking.hallId?.amenities || []).map((amenity: string) => (
                    <span key={amenity} className="px-2 py-0.5 bg-white text-gray-700 rounded-full text-xs whitespace-nowrap shadow-sm border border-gray-200 hover:bg-primary-50 transition-colors cursor-pointer">{amenity}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* Booking Info */}
            <div className="flex-1 flex flex-col justify-between">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Booking Information</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>
                  <p className="text-gray-500">Check-in</p>
                  <p className="font-semibold">{selectedBooking.startDate ? new Date(selectedBooking.startDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Check-out</p>
                  <p className="font-semibold">{selectedBooking.endDate ? new Date(selectedBooking.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Guests</p>
                  <p className="font-semibold">{selectedBooking.guests || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-semibold">₹{selectedBooking.totalPrice || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className={`font-bold ${getStatusColor(selectedBooking.status)}`}>{getStatusDisplayText(selectedBooking.status)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment</p>
                  <p className={`font-bold ${getPaymentStatusColor(selectedBooking.paymentStatus, selectedBooking.advancePaid)}`}>{getPaymentStatusDisplayText(selectedBooking.paymentStatus, selectedBooking.advancePaid)}</p>
                </div>
              </div>
              {/* Calendar Links */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-gray-700">Add to Calendar:</span>
                <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline font-medium">Google</a>
                <a href={outlookUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline font-medium">Outlook</a>
                <a href={icsUrl} download={`booking-${selectedBooking._id}.ics`} className="text-primary-600 underline font-medium">iCal</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 my-2 print:hidden"></div>

          {/* Totals and Services */}
          <div className="p-4 border-b text-sm print:hidden">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Services Total</span>
                <span>₹{servicesTotal}</span>
              </div>
              <div className="flex justify-between font-extrabold text-lg border-t pt-2 mt-2">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>
          </div>

          {/* --- Service Management Section --- */}
          <div className="p-4 border-b print:hidden">
            <h3 className="text-base font-bold mb-2">Manage Services for this Booking</h3>
            <button className="btn-primary text-sm px-4 py-1">Add Service</button>
          </div>

          {/* Modal Actions */}
          <div className="p-4 print:hidden flex gap-2 flex-wrap justify-between">
            <button className="btn-secondary text-base w-full py-2 font-semibold rounded-lg shadow-sm" onClick={() => setShowBookingModal(false)}>Close</button>
            <button className="btn-primary text-base w-full py-2 font-semibold rounded-lg shadow-sm" onClick={() => window.print()}>Download/Print</button>
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
    <div className="min-h-screen bg-gray-50">
      {/* OYO-style Search Bar */}
      <nav className="w-full bg-white shadow-sm py-3 px-4 flex items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }} />
        </div>
        <form onSubmit={handleSearch} className="flex-1 flex items-center max-w-4xl mx-4 bg-gray-100 rounded-lg px-2 py-1 border border-gray-200 gap-2">
          <input
            type="text"
            className="flex-1 bg-transparent px-3 py-2 focus:outline-none text-gray-800"
            placeholder="Search by city, hall, or venue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <input
            type="date"
            className="bg-transparent px-3 py-2 rounded border border-gray-200 focus:outline-none text-gray-800"
            value={checkIn}
            onChange={e => setCheckIn(e.target.value)}
            required
          />
          <input
            type="date"
            className="bg-transparent px-3 py-2 rounded border border-gray-200 focus:outline-none text-gray-800"
            value={checkOut}
            onChange={e => setCheckOut(e.target.value)}
            required
          />
          <input
            type="number"
            min={1}
            className="w-20 bg-transparent px-3 py-2 rounded border border-gray-200 focus:outline-none text-gray-800"
            placeholder="Guests"
            value={guests}
            onChange={e => setGuests(Number(e.target.value))}
            required
          />
          <button type="submit" className="ml-2 btn-primary">Search</button>
        </form>
        <div className="flex items-center gap-4">
          {/* Add more nav items if needed */}
        </div>
      </nav>
      {/* Main Profile Content */}
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Profile Info */}
      <div className="bg-white rounded-xl shadow p-6 mb-8 flex flex-col md:flex-row items-center gap-6">
        <div className="bg-primary-100 rounded-full w-24 h-24 flex items-center justify-center text-4xl font-bold text-primary-700 overflow-hidden">
          {session.user.image ? (
            <img src={session.user.image} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
          ) : (
            <span>{session.user.name?.[0] || session.user.email?.[0] || 'U'}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">{session.user.name || session.user.email}</h2>
          <div className="text-gray-500 mb-2">{session.user.email}</div>
            {(session.user as any).phone && (
              <div className="text-gray-500 mb-2">{(session.user as any).phone}</div>
            )}
          <button className="btn-primary" onClick={() => setShowEdit(true)}>Edit Profile</button>
        </div>
        <div className="hidden md:block">
          <div className="mb-2 font-semibold">Notifications</div>
          <div className="text-sm text-gray-600 space-y-1 max-h-40 overflow-y-auto">
            {notifLoading ? (
              <div>Loading...</div>
            ) : notifError ? (
              <div className="text-red-600">{notifError}</div>
            ) : notifications.length === 0 ? (
              <div>No notifications</div>
            ) : notifications.slice(0, 5).map((n: any) => (
              <div key={n._id} className={`flex items-center gap-2 p-2 rounded ${n.read ? 'bg-gray-50' : 'bg-blue-50 font-semibold'}`}>
                <span className="capitalize text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 mr-2">{n.type}</span>
                <span className="flex-1">{n.message}</span>
                <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                {!n.read && <button className="ml-2 text-primary-600 underline text-xs" onClick={() => markNotificationRead(n._id)}>Mark as read</button>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs for Bookings */}
      <div className="mb-6 flex gap-4 border-b">
        {TABS.map(t => (
          <button
            key={t}
            className={`py-2 px-4 -mb-px border-b-2 font-semibold transition ${tab === t ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-primary-600'}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="mb-8">
        {loading ? (
          <div>Loading...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-gray-500">No bookings found.</div>
        ) : (
          <div className="grid gap-4">
            {filteredBookings.map((b: any) => (
              <div key={b._id} className="bg-white rounded-lg p-4 shadow flex flex-col md:flex-row md:items-center md:justify-between border cursor-pointer hover:bg-primary-50"
                onClick={() => { setSelectedBooking(b); setShowBookingModal(true); }}>
                <div className="flex items-center gap-4">
                  {b.hallId?.images?.[0] && (
                    <img src={b.hallId.images[0]} alt={b.hallId.name || 'Venue'} className="w-16 h-16 rounded object-cover" />
                  )}
                  <div>
                    <div className="font-semibold text-lg">{b.hallId?.name || 'Event Hall'}</div>
                    <div className="text-gray-600">{b.startDate ? new Date(b.startDate).toLocaleDateString() : 'N/A'} ({b.status})</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2 md:mt-0">
                    <button className="btn-primary" onClick={e => { e.stopPropagation(); window.print(); }}>Download/Print</button>
                    {tab === 'Upcoming' && <button className="btn-primary" onClick={e => { e.stopPropagation(); setShowReschedule(true); setRescheduleBookingId(b._id); }}>Reschedule</button>}
                    {tab === 'Upcoming' && <button className="btn-primary" onClick={e => { e.stopPropagation(); setShowCancelReason(true); setCancelBookingId(b._id); }}>Cancel</button>}
                    {tab === 'Past' && <button className="btn-primary" onClick={e => { e.stopPropagation(); /* Leave Review logic here */ }}>Leave Review</button>}
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security & Support */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Security</h3>
          <button className="btn-primary mb-2 w-full" onClick={() => setShowChangePassword(true)}>Change Password</button>
          <button className="btn-primary w-full" onClick={() => setShow2FA(true)}>Enable Two-Factor Authentication</button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
          <button className="btn-primary w-full" onClick={() => setShowSupport(true)}>Contact Support</button>
        </div>
      </div>

      {/* My Planned Events Section */}
      <div className="w-full max-w-5xl mx-auto mt-10 mb-10 bg-white/70 border border-primary-200 rounded-xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold mb-4 text-primary-700">My Planned Events</h2>
        {plannedEventsLoading ? (
          <table className="min-w-full border animate-pulse">
            <thead>
              <tr className="bg-primary-50">
                <th className="p-2 border">Event Type</th>
                <th className="p-2 border">City</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Guests</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Assigned Manager</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, i) => (
                <tr key={i}>
                  {Array(6).fill(0).map((_, j) => (
                    <td key={j} className="p-2 border">
                      <div className="h-5 bg-gray-200 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : plannedEvents.length === 0 ? (
          <div className="text-gray-500">No planned events found.</div>
        ) : (
          <table className="min-w-full border">
            <thead>
              <tr className="bg-primary-50">
                <th className="p-2 border">Event Type</th>
                <th className="p-2 border">City</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Guests</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Assigned Manager</th>
              </tr>
            </thead>
            <tbody>
              {plannedEvents.map(ev => (
                <tr key={ev._id}>
                  <td className="p-2 border">{ev.eventType}</td>
                  <td className="p-2 border">{ev.city}</td>
                  <td className="p-2 border">{ev.date}</td>
                  <td className="p-2 border">{ev.guests}</td>
                  <td className="p-2 border">{ev.status || '-'}</td>
                  <td className="p-2 border">{ev.eventManagerName || 'Not assigned yet'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
    </div>
  );
} 