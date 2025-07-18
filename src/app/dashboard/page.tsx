'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';
import Link from 'next/link';
import { format } from 'date-fns';

type UserRef = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
};

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
    ownerId?: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  userId?: string | UserRef;
  ownerId?: string;
  serviceBookings?: any[];
}

interface Hall {
  _id: string;
  name: string;
  description: string;
  images: string[];
  location: {
    city: string;
    state: string;
  };
  price: number;
  capacity: number;
  status: 'active' | 'inactive';
  amenities: string[];
  averageRating?: number;
  ratingDistribution?: Record<string, number>;
  ownerId?: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [halls, setHalls] = useState<Hall[]>([]);
  const [hallsLoading, setHallsLoading] = useState(true);
  const [hallsError, setHallsError] = useState('');
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [availabilityHall, setAvailabilityHall] = useState<Hall | null>(null);
  const [availability, setAvailability] = useState<any[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [availabilityForm, setAvailabilityForm] = useState({ date: '', isAvailable: false, specialPrice: '' });
  const availabilityDialogRef = useRef<HTMLDialogElement>(null);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImagePreviewUrls, setEditImagePreviewUrls] = useState<string[]>([]);
  const [editLocation, setEditLocation] = useState<any>(null);
  const [chatType, setChatType] = useState<'user' | 'owner' | 'provider' | null>(null);
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatDialogRef = useRef<HTMLDialogElement>(null);
  const [hallReviews, setHallReviews] = useState<Record<string, any[]>>({});
  const [reviewLoading, setReviewLoading] = useState<Record<string, boolean>>({});
  const [reviewError, setReviewError] = useState<Record<string, string>>({});
  const [reviewResponse, setReviewResponse] = useState<Record<string, string>>({});
  const [flagLoading, setFlagLoading] = useState<Record<string, boolean>>({});
  const [serviceBookings, setServiceBookings] = useState<any[]>([]);
  const [myServices, setMyServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');
  const [editService, setEditService] = useState<any | null>(null);
  const [editServiceForm, setEditServiceForm] = useState<any | null>(null);
  const [editServiceLoading, setEditServiceLoading] = useState(false);
  const [editServiceError, setEditServiceError] = useState('');
  const [editServiceImageFile, setEditServiceImageFile] = useState<File | null>(null);
  const [editServiceImagePreview, setEditServiceImagePreview] = useState<string | null>(null);
  const [availabilityService, setAvailabilityService] = useState<any | null>(null);
  const [availabilityModalOpen, setAvailabilityModalOpen] = useState(false);
  const [availabilityDates, setAvailabilityDates] = useState<Date[]>([]);
  const [reviewsService, setReviewsService] = useState<any | null>(null);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [serviceReviews, setServiceReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        let response;
        if (session?.user?.role === 'owner') {
          response = await fetch('/api/admin/bookings?limit=100');
        } else {
          response = await fetch('/api/bookings');
        }
        const data = await response.json();
        setBookings(data.bookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session && session.user.role !== 'provider') {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.role === 'owner') {
      const fetchHalls = async () => {
        try {
          setHallsLoading(true);
          const res = await fetch('/api/halls');
          const data = await res.json();
          setHalls(data.halls || []);
        } catch (err) {
          setHallsError('Failed to fetch your halls.');
        } finally {
          setHallsLoading(false);
        }
      };
      fetchHalls();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.role === 'owner') {
      setAnalyticsLoading(true);
      fetch('/api/owner/analytics')
        .then(res => res.json())
        .then(data => setAnalytics(data))
        .catch(() => setAnalyticsError('Failed to load analytics.'))
        .finally(() => setAnalyticsLoading(false));
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.role === 'provider') {
      const fetchServiceBookings = async () => {
        try {
          const res = await fetch('/api/service-bookings');
          const data = await res.json();
          setServiceBookings(data.bookings || []);
        } catch {
          setServiceBookings([]);
        }
      };
      fetchServiceBookings();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.role === 'provider') {
      const fetchMyServices = async () => {
        try {
          setServicesLoading(true);
          const res = await fetch(`/api/services?providerId=${session.user.id}`);
          const data = await res.json();
          setMyServices(data.services || []);
        } catch (error) {
          setServicesError('Failed to fetch your services');
        } finally {
          setServicesLoading(false);
        }
      };
      fetchMyServices();
    }
  }, [session]);

  const filteredBookings = bookings.filter((booking) => {
    const isPast = new Date(booking.endDate) < new Date();
    return activeTab === 'past' ? isPast : !isPast;
  });

  const handleToggleHallStatus = useCallback(async (hallId: string, currentStatus: 'active' | 'inactive') => {
    try {
      const res = await fetch(`/api/halls/${hallId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus === 'active' ? 'inactive' : 'active' }),
      });
      if (!res.ok) throw new Error('Failed to update hall status');
      setHalls((prev) => prev.map((h) => h._id === hallId ? { ...h, status: currentStatus === 'active' ? 'inactive' : 'active' } : h));
    } catch (err) {
      alert('Failed to update hall status.');
    }
  }, []);

  const openEditDialog = (hall: Hall) => {
    setEditingHall(hall);
    setEditForm({
      name: hall.name,
      description: hall.description,
      price: hall.price,
      capacity: hall.capacity,
      amenities: hall.amenities || [],
      images: hall.images || [],
      location: hall.location || { address: '', city: '', state: '', coordinates: { type: 'Point', coordinates: [0,0] } },
    });
    setEditLocation(hall.location || { address: '', city: '', state: '', coordinates: { type: 'Point', coordinates: [0,0] } });
    setEditImageFiles([]);
    setEditImagePreviewUrls([]);
    setEditError('');
    editDialogRef.current?.showModal();
  };

  const closeEditDialog = () => {
    setEditingHall(null);
    setEditForm(null);
    setEditError('');
    editDialogRef.current?.close();
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditAmenitiesChange = (amenity: string) => {
    setEditForm((prev: any) => {
      const amenities = prev.amenities.includes(amenity)
        ? prev.amenities.filter((a: string) => a !== amenity)
        : [...prev.amenities, amenity];
      return { ...prev, amenities };
    });
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditImageFiles(files);
    setEditImagePreviewUrls(files.map(file => URL.createObjectURL(file)));
  };

  const handleRemoveExistingImage = (imgUrl: string) => {
    setEditForm((prev: any) => ({ ...prev, images: prev.images.filter((img: string) => img !== imgUrl) }));
  };

  const handleEditLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value,
        coordinates: prev.location.coordinates,
      },
    }));
  };

  const handleEditCoordinatesChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const value = parseFloat(e.target.value);
    setEditForm((prev: any) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: {
          ...prev.location.coordinates,
          coordinates: prev.location.coordinates.coordinates.map((c: number, i: number) => i === idx ? value : c),
        },
      },
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHall) return;
    setEditLoading(true);
    setEditError('');
    try {
      let uploadedImages = [];
      if (editImageFiles.length > 0) {
        const formData = new FormData();
        editImageFiles.forEach(file => formData.append('images', file));
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Image upload failed');
        const data = await res.json();
        uploadedImages = data.urls || [];
      }
      const images = [...(editForm.images || []), ...uploadedImages];
      const res = await fetch(`/api/halls/${editingHall._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, images }),
      });
      if (!res.ok) throw new Error('Failed to update hall');
      setHalls((prev) => prev.map((h) => h._id === editingHall._id ? { ...h, ...editForm, images } : h));
      closeEditDialog();
    } catch (err) {
      setEditError('Failed to update hall.');
    } finally {
      setEditLoading(false);
    }
  };

  const bookingsChart = useMemo(() => {
    if (!analytics?.bookingsByMonth) return null;
    const months = Object.keys(analytics.bookingsByMonth);
    const values = Object.values(analytics.bookingsByMonth).map(v => Number(v));
    const max = Math.max(...values, 1);
    return (
      <div className="flex items-end gap-2 h-24 mt-2">
        {months.map((m, i) => (
          <div key={m} className="flex flex-col items-center">
            <div
              className="bg-primary-600 w-4 rounded"
              style={{ height: `${(Number(values[i]) / max) * 80 + 8}px` }}
              title={`${values[i]} bookings`}
            ></div>
            <span className="text-xs mt-1 text-gray-500" style={{ writingMode: 'vertical-lr', height: '32px' }}>{m.slice(5)}</span>
          </div>
        ))}
      </div>
    );
  }, [analytics]);

  const openAvailabilityDialog = async (hall: Hall) => {
    setAvailabilityHall(hall);
    setAvailabilityLoading(true);
    setAvailabilityError('');
    setAvailability([]);
    setAvailabilityForm({ date: '', isAvailable: false, specialPrice: '' });
    availabilityDialogRef.current?.showModal();
    try {
      const res = await fetch(`/api/halls/${hall._id}/availability`);
      const data = await res.json();
      setAvailability(data.availability || []);
    } catch {
      setAvailabilityError('Failed to load availability.');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const closeAvailabilityDialog = () => {
    setAvailabilityHall(null);
    setAvailability([]);
    setAvailabilityForm({ date: '', isAvailable: false, specialPrice: '' });
    setAvailabilityError('');
    availabilityDialogRef.current?.close();
  };

  const handleAvailabilityFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAvailabilityForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAvailabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!availabilityHall) return;
    setAvailabilityLoading(true);
    setAvailabilityError('');
    try {
      const res = await fetch(`/api/halls/${availabilityHall._id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: availabilityForm.date,
          isAvailable: availabilityForm.isAvailable,
          specialPrice: availabilityForm.specialPrice ? Number(availabilityForm.specialPrice) : undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to update availability');
      const data = await res.json();
      setAvailability(data.availability || []);
      setAvailabilityForm({ date: '', isAvailable: false, specialPrice: '' });
    } catch {
      setAvailabilityError('Failed to update availability.');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleUnblockDate = async (date: string) => {
    if (!availabilityHall) return;
    setAvailabilityLoading(true);
    setAvailabilityError('');
    try {
      const res = await fetch(`/api/halls/${availabilityHall._id}/availability`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      if (!res.ok) throw new Error('Failed to unblock date');
      const data = await res.json();
      setAvailability(data.availability || []);
    } catch {
      setAvailabilityError('Failed to unblock date.');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleMessage = async (participantIds: string[], type: string, meta: any = {}) => {
    if (!session || !participantIds.length) return;
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participants: participantIds,
        conversationType: type,
        ...meta,
      }),
    });
    const data = await res.json();
    if (data.conversation?._id) {
      router.push(`/messages/${data.conversation._id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* My Bookings Section - Only for regular users */}
      {session?.user?.role === 'user' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
          <p className="text-gray-600 mb-6">Manage your hall bookings and view booking history</p>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === 'upcoming'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upcoming Bookings
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === 'past'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Past Bookings
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading bookings...</div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No bookings found</p>
                  <Link href="/halls" className="text-primary-600 hover:text-primary-700 font-medium">
                    Browse halls
                  </Link>
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredBookings.map((booking) => (
                    <li key={booking._id} className="p-6 hover:bg-gray-50 cursor-pointer">
                      <div 
                        onClick={() => router.push(`/bookings/${booking._id}`)}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-20 h-20 flex-shrink-0">
                            {booking.hallId && booking.hallId.images && booking.hallId.images[0] ? (
                              <Image
                                src={getImageUrl(booking.hallId.images[0])}
                                alt={booking.hallId.name}
                                fill
                                className="object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-lg">{booking.hallId && booking.hallId.name ? booking.hallId.name : 'Hall deleted'}</div>
                            <div className="text-gray-600 text-sm">{booking.hallId && booking.hallId.location && booking.hallId.location.city && booking.hallId.location.state ? `${booking.hallId.location.city}, ${booking.hallId.location.state}` : 'Location unavailable'}</div>
                            <div className="text-gray-600 text-sm">Check-in: {new Date(booking.startDate).toLocaleDateString()}</div>
                            <div className="text-gray-600 text-sm">Check-out: {new Date(booking.endDate).toLocaleDateString()}</div>
                            <div className="text-gray-600 text-sm">Total: ₹{booking.totalPrice}</div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              booking.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : booking.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              booking.paymentStatus === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : booking.paymentStatus === 'refunded'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                // Collect all participant IDs
                                const userId = typeof booking.userId === 'object' ? booking.userId._id : booking.userId;
                                const ownerId = booking.hallId && booking.hallId.ownerId ? (typeof booking.hallId.ownerId === 'object' ? booking.hallId.ownerId._id : booking.hallId.ownerId) : null;
                                const providerIds = (booking.serviceBookings || []).map(sb => typeof sb.providerId === 'object' ? sb.providerId._id : sb.providerId).filter(Boolean);
                                // Remove duplicates and current user
                                const allIds = [userId, ownerId, ...providerIds].filter((id, idx, arr) => id && arr.indexOf(id) === idx && id !== session.user.id);
                                // Always include current user
                                const participantIds = [session.user.id, ...allIds];
                                await handleMessage(participantIds, 'coordination', { bookingId: booking._id });
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Group Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Service Provider Sections */}
      {session?.user?.role === 'provider' && (
        <>
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">My Listed Services</h2>
            <p className="text-gray-600 mb-6">Manage your listed services and view their details.</p>
            
            {servicesLoading ? (
              <div className="text-center py-8">Loading your services...</div>
            ) : servicesError ? (
              <div className="text-red-600 py-4">{servicesError}</div>
            ) : myServices.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't listed any services yet.</p>
                <Link href="/provide-service" className="text-primary-600 hover:text-primary-700 font-medium">
                  List a Service
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myServices.map((service) => (
                  <div key={service._id} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                    {service.image && (
                      <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={service.image}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                    <p className="text-gray-600 mb-2">{service.serviceType}</p>
                    <p className="text-gray-700 mb-4">{service.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-medium">₹{service.price}</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {service.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                      <p>{service.city}, {service.state}</p>
                      <p className="mt-1">Contact: {service.contact}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        className={`px-4 py-2 rounded text-white ${service.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        onClick={async () => {
                          const newStatus = service.status === 'active' ? 'inactive' : 'active';
                          const res = await fetch(`/api/services/${service._id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: newStatus }),
                          });
                          if (res.ok) {
                            setMyServices((prev: any[]) => prev.map(s => s._id === service._id ? { ...s, status: newStatus } : s));
                          } else {
                            alert('Failed to update status.');
                          }
                        }}
                      >
                        {service.status === 'active' ? 'Delist' : 'Relist'}
                      </button>
                      <button
                        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        onClick={() => {
                          setEditService(service);
                          setEditServiceForm({ ...service });
                          setEditServiceError('');
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                        onClick={() => {
                          setAvailabilityService(service);
                          setAvailabilityDates((service.availability || []).filter((a: any) => !a.isAvailable).map((a: any) => new Date(a.date)));
                          setAvailabilityModalOpen(true);
                          setAvailabilityError('');
                        }}
                      >
                        Manage Availability
                      </button>
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={async () => {
                          setReviewsService(service);
                          setReviewsModalOpen(true);
                          setReviewsLoading(true);
                          setReviewsError('');
                          try {
                            const res = await fetch(`/api/services/${service._id}/reviews`);
                            if (res.ok) {
                              const data = await res.json();
                              setServiceReviews(data.reviews || []);
                            } else {
                              setReviewsError('Failed to fetch reviews.');
                            }
                          } catch {
                            setReviewsError('Failed to fetch reviews.');
                          } finally {
                            setReviewsLoading(false);
                          }
                        }}
                      >
                        Show Reviews
                      </button>
                      <Link
                        href={"/services/" + service._id}
                        className="text-primary-600 hover:text-primary-700 text-sm px-4 py-2"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Service Bookings</h2>
            <p className="text-gray-600 mb-6">View and manage bookings for your services.</p>
            
            {serviceBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No bookings found for your services.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {serviceBookings.map((booking) => (
                    <li key={booking._id} className="p-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{booking.serviceId?.name} ({booking.serviceId?.serviceType})</h3>
                            <p className="text-gray-600">
                              Booked by: {booking.userId?.name} ({booking.userId?.email}
                              {booking.userId?.phone ? `, ${booking.userId.phone}` : ''})
                            </p>
                            <p className="text-gray-600">
                              Hall: {booking.hallId?.name} (Owner: {booking.hallId?.ownerId?.name})
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-lg font-semibold">₹{booking.totalPrice}</span>
                            <div className="flex gap-2 mt-1">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : booking.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                booking.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.paymentStatus === 'refunded'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.paymentStatus === 'paid'
                                  ? 'Payment Received'
                                  : booking.paymentStatus === 'refunded'
                                  ? 'Refunded'
                                  : 'Payment Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-4">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              // Collect all participant IDs
                              const userId = typeof booking.userId === 'object' ? booking.userId._id : booking.userId;
                              const ownerId = booking.hallId && booking.hallId.ownerId ? (typeof booking.hallId.ownerId === 'object' ? booking.hallId.ownerId._id : booking.hallId.ownerId) : null;
                              const providerIds = (booking.serviceBookings || []).map(sb => typeof sb.providerId === 'object' ? sb.providerId._id : sb.providerId).filter(Boolean);
                              // Remove duplicates and current user
                              const allIds = [userId, ownerId, ...providerIds].filter((id, idx, arr) => id && arr.indexOf(id) === idx && id !== session.user.id);
                              // Always include current user
                              const participantIds = [session.user.id, ...allIds];
                              await handleMessage(participantIds, 'coordination', { bookingId: booking._id });
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Group Chat
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {/* Owner Sections */}
      {session?.user?.role === 'owner' && (
        <>
          {/* My Listed Halls */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">My Listed Halls</h2>
            <p className="text-gray-600 mb-6">Manage your listed halls and view their details.</p>
            {hallsLoading ? (
              <div className="text-center py-8">Loading your halls...</div>
            ) : hallsError ? (
              <div className="text-red-600 py-4">{hallsError}</div>
            ) : halls.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't listed any halls yet.</p>
                <Link href="/list-your-hall" className="text-primary-600 hover:text-primary-700 font-medium">
                  List a Hall
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {halls.map((hall) => (
                  <div key={hall._id} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                    <div>
                      <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                        {hall.images && hall.images[0] ? (
                          <Image src={getImageUrl(hall.images[0])} alt={hall.name} fill className="object-cover" />
                        ) : (
                          <div className="w-40 h-40 bg-gray-200 rounded-lg" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{hall.name}</h3>
                      <p className="text-gray-600 mb-2">{hall.location.city}, {hall.location.state}</p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-medium">₹{hall.price}/day</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${hall.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{hall.status}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleToggleHallStatus(hall._id, hall.status)}
                        className={`px-4 py-2 rounded text-white ${hall.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        {hall.status === 'active' ? 'Delist' : 'Relist'}
                      </button>
                      <button
                        onClick={() => openEditDialog(hall)}
                        className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openAvailabilityDialog(hall)}
                        className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Manage Availability
                      </button>
                      <button
                        onClick={() => fetchReviews(hall._id)}
                        className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                      >
                        Show Reviews
                      </button>
                      <Link href={`/halls/${hall._id}`} className="text-primary-600 hover:text-primary-700 text-sm px-4 py-2">View</Link>
                    </div>
                    {hallReviews[hall._id] && (
                      <div className="mt-4 bg-gray-50 p-4 rounded">
                        <h4 className="font-semibold mb-2">Reviews</h4>
                        {reviewLoading[hall._id] ? (
                          <div>Loading reviews...</div>
                        ) : reviewError[hall._id] ? (
                          <div className="text-red-500">{reviewError[hall._id]}</div>
                        ) : hallReviews[hall._id].length === 0 ? (
                          <div className="text-gray-500">No reviews yet.</div>
                        ) : (
                          <ul className="divide-y">
                            {hallReviews[hall._id].map((review) => (
                              <li key={review._id} className="py-3">
                                <div className="flex items-center gap-2 mb-1">
                                  {[...Array(5)].map((_, i) => (
                                    <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                  <span className="ml-2 text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="mb-1 text-gray-700">{review.comment}</div>
                                {review.images && review.images.length > 0 && (
                                  <div className="flex gap-2 mb-1">
                                    {review.images.map((img: string, i: number) => (
                                      <img key={i} src={getImageUrl(img)} alt="Review" className="w-12 h-12 object-cover rounded" />
                                    ))}
                                  </div>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookings for My Halls */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Bookings for My Halls</h2>
            <p className="text-gray-600 mb-6">All bookings made for your listed halls.</p>
            {hallsLoading ? (
              <div className="text-center py-8">Loading bookings...</div>
            ) : hallsError ? (
              <div className="text-red-600 py-4">{hallsError}</div>
            ) : halls.length === 0 ? (
              <div className="text-center py-8">You have not listed any halls yet.</div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {bookings.filter(b => halls.some(h => h._id === b.hallId._id)).map((booking) => (
                    <li key={booking._id} className="p-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">{booking.hallId.name}</h3>
                            <p className="text-gray-600">
                              Booked by: {booking.userId?.name} ({booking.userId?.email}{booking.userId?.phone ? `, ${booking.userId.phone}` : ''})
                            </p>
                            <p className="text-gray-600">
                              Dates: {format(new Date(booking.startDate), 'dd MMM yyyy')} - {format(new Date(booking.endDate), 'dd MMM yyyy')}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-lg font-semibold">₹{booking.totalPrice}</span>
                            <div className="flex gap-2 mt-1">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : booking.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                booking.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.paymentStatus === 'refunded'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.paymentStatus === 'paid'
                                  ? 'Payment Received'
                                  : booking.paymentStatus === 'refunded'
                                  ? 'Refunded'
                                  : 'Payment Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-4">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              // Collect all participant IDs
                              const userId = typeof booking.userId === 'object' ? booking.userId._id : booking.userId;
                              const ownerId = booking.hallId && booking.hallId.ownerId ? (typeof booking.hallId.ownerId === 'object' ? booking.hallId.ownerId._id : booking.hallId.ownerId) : null;
                              const providerIds = (booking.serviceBookings || []).map(sb => typeof sb.providerId === 'object' ? sb.providerId._id : sb.providerId).filter(Boolean);
                              // Remove duplicates and current user
                              const allIds = [userId, ownerId, ...providerIds].filter((id, idx, arr) => id && arr.indexOf(id) === idx && id !== session.user.id);
                              // Always include current user
                              const participantIds = [session.user.id, ...allIds];
                              await handleMessage(participantIds, 'coordination', { bookingId: booking._id });
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Group Chat
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Hall Modal */}
      <dialog ref={editDialogRef} className="rounded-lg p-0 w-full max-w-lg">
        {editingHall && (
          <form onSubmit={handleEditSubmit} className="bg-white p-6 rounded-lg shadow-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Hall Details</h3>
            <div className="mb-4">
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={editForm?.name || ''}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={editForm?.description || ''}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Price (per day)</label>
              <input
                type="number"
                name="price"
                value={editForm?.price || ''}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
                required
                min={0}
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Capacity</label>
              <input
                type="number"
                name="capacity"
                value={editForm?.capacity || ''}
                onChange={handleEditChange}
                className="w-full border rounded px-3 py-2"
                required
                min={1}
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {['WiFi', 'Air Conditioning', 'Music System', 'Parking', 'Catering'].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="amenities"
                      value={amenity}
                      checked={editForm?.amenities?.includes(amenity)}
                      onChange={() => handleEditAmenitiesChange(amenity)}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Location</label>
              <input
                type="text"
                name="address"
                value={editForm?.location?.address || ''}
                onChange={handleEditLocationChange}
                className="w-full border rounded px-3 py-2 mb-2"
                placeholder="Address"
                required
              />
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  name="city"
                  value={editForm?.location?.city || ''}
                  onChange={handleEditLocationChange}
                  className="w-1/2 border rounded px-3 py-2"
                  placeholder="City"
                  required
                />
                <input
                  type="text"
                  name="state"
                  value={editForm?.location?.state || ''}
                  onChange={handleEditLocationChange}
                  className="w-1/2 border rounded px-3 py-2"
                  placeholder="State"
                  required
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  value={editForm?.location?.coordinates?.coordinates?.[0] || ''}
                  onChange={e => handleEditCoordinatesChange(e, 0)}
                  className="w-1/2 border rounded px-3 py-2"
                  placeholder="Longitude"
                  required
                />
                <input
                  type="number"
                  step="any"
                  value={editForm?.location?.coordinates?.coordinates?.[1] || ''}
                  onChange={e => handleEditCoordinatesChange(e, 1)}
                  className="w-1/2 border rounded px-3 py-2"
                  placeholder="Latitude"
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Images</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editForm?.images?.map((img: string, i: number) => (
                  <div key={i} className="relative w-20 h-20">
                    <Image src={getImageUrl(img)} alt="Hall image" fill className="object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(img)}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {editImagePreviewUrls.map((url, i) => (
                  <div key={`preview-${i}`} className="relative w-20 h-20">
                    <Image src={url} alt="Preview" fill className="object-cover rounded opacity-70" />
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleEditImageChange}
                className="w-full"
              />
            </div>
            {editError && <div className="text-red-500 mb-2">{editError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={closeEditDialog} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </dialog>

      {/* Availability Modal */}
      <dialog ref={availabilityDialogRef} className="rounded-lg p-0 w-full max-w-lg">
        {availabilityHall && (
          <form onSubmit={handleAvailabilitySubmit} className="bg-white p-6 rounded-lg shadow-md w-full">
            <h3 className="text-xl font-bold mb-4">Manage Availability for {availabilityHall.name}</h3>
            <div className="mb-4">
              <label className="block font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={availabilityForm.date}
                onChange={handleAvailabilityFormChange}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                name="isAvailable"
                checked={availabilityForm.isAvailable}
                onChange={handleAvailabilityFormChange}
                id="isAvailable"
              />
              <label htmlFor="isAvailable" className="font-medium">Available (uncheck to block date)</label>
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Special Price (optional)</label>
              <input
                type="number"
                name="specialPrice"
                value={availabilityForm.specialPrice}
                onChange={handleAvailabilityFormChange}
                className="w-full border rounded px-3 py-2"
                min={0}
              />
            </div>
            {availabilityError && <div className="text-red-500 mb-2">{availabilityError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={closeAvailabilityDialog} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Close</button>
              <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700" disabled={availabilityLoading}>
                {availabilityLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Blocked/Custom Dates</h4>
              {availabilityLoading ? (
                <div>Loading...</div>
              ) : availability.length === 0 ? (
                <div className="text-gray-500">No blocked or custom dates.</div>
              ) : (
                <ul className="divide-y max-h-40 overflow-y-auto">
                  {availability.map((a, i) => (
                    <li key={i} className="flex items-center justify-between py-2">
                      <div>
                        <span className="font-medium">{format(new Date(a.date), 'yyyy-MM-dd')}</span>
                        {!a.isAvailable && <span className="ml-2 text-red-600">(Blocked)</span>}
                        {a.specialPrice && <span className="ml-2 text-blue-600">Special Price: ₹{a.specialPrice}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnblockDate(a.date)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Unblock
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        )}
      </dialog>

      {/* Edit Service Modal */}
      {editService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setEditService(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Service</h2>
            {editServiceError && <div className="text-red-600 mb-2">{editServiceError}</div>}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEditServiceLoading(true);
                setEditServiceError('');
                try {
                  const res = await fetch(`/api/services/${editService._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(editServiceForm),
                  });
                  if (res.ok) {
                    const updated = await res.json();
                    setMyServices((prev: any[]) => prev.map(s => s._id === updated.service._id ? updated.service : s));
                    setEditService(null);
                  } else {
                    const err = await res.json();
                    setEditServiceError(err.message || 'Failed to update service.');
                  }
                } catch (err: any) {
                  setEditServiceError('Failed to update service.');
                } finally {
                  setEditServiceLoading(false);
                }
              }}
            >
              <div className="mb-4">
                <label className="block mb-1 font-medium">Name</label>
                <input
                  className="input-field"
                  value={editServiceForm?.name || ''}
                  onChange={e => setEditServiceForm((f: any) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Type</label>
                <input
                  className="input-field"
                  value={editServiceForm?.serviceType || ''}
                  onChange={e => setEditServiceForm((f: any) => ({ ...f, serviceType: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  className="input-field"
                  value={editServiceForm?.description || ''}
                  onChange={e => setEditServiceForm((f: any) => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Price</label>
                <input
                  type="number"
                  className="input-field"
                  value={editServiceForm?.price || ''}
                  onChange={e => setEditServiceForm((f: any) => ({ ...f, price: e.target.value }))}
                  required
                  min={0}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">City</label>
                <input
                  className="input-field"
                  value={editServiceForm?.city || ''}
                  onChange={e => setEditServiceForm((f: any) => ({ ...f, city: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">State</label>
                <input
                  className="input-field"
                  value={editServiceForm?.state || ''}
                  onChange={e => setEditServiceForm((f: any) => ({ ...f, state: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Contact</label>
                <input
                  className="input-field"
                  value={editServiceForm?.contact || ''}
                  onChange={e => setEditServiceForm((f: any) => ({ ...f, contact: e.target.value }))}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                disabled={editServiceLoading}
              >
                {editServiceLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Availability Service Modal */}
      {availabilityModalOpen && availabilityService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setAvailabilityModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Manage Availability</h2>
            {availabilityError && <div className="text-red-600 mb-2">{availabilityError}</div>}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Blocked Dates</label>
              <input
                type="date"
                onChange={e => {
                  const date = new Date(e.target.value);
                  if (!availabilityDates.some(d => d.toDateString() === date.toDateString())) {
                    setAvailabilityDates(prev => [...prev, date]);
                  }
                }}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {availabilityDates.map((date, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 bg-gray-200 rounded-full text-sm">
                    {format(date, 'yyyy-MM-dd')}
                    <button
                      className="ml-2 text-red-600 hover:text-red-800"
                      onClick={() => setAvailabilityDates(prev => prev.filter((d, i) => i !== idx))}
                      title="Remove"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <button
              className="w-full px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              disabled={availabilityLoading}
              onClick={async () => {
                setAvailabilityLoading(true);
                setAvailabilityError('');
                try {
                  const blocked = availabilityDates.map(date => ({ date, isAvailable: false }));
                  const res = await fetch(`/api/services/${availabilityService._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ availability: blocked }),
                  });
                  if (res.ok) {
                    setMyServices((prev: any[]) => prev.map(s => s._id === availabilityService._id ? { ...s, availability: blocked } : s));
                    setAvailabilityModalOpen(false);
                  } else {
                    setAvailabilityError('Failed to update availability.');
                  }
                } catch {
                  setAvailabilityError('Failed to update availability.');
                } finally {
                  setAvailabilityLoading(false);
                }
              }}
            >
              {availabilityLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {reviewsModalOpen && reviewsService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setReviewsModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Service Reviews</h2>
            {reviewsLoading ? (
              <div className="text-center py-8">Loading reviews...</div>
            ) : reviewsError ? (
              <div className="text-red-600 mb-2">{reviewsError}</div>
            ) : serviceReviews.length === 0 ? (
              <div className="text-gray-500">No reviews yet.</div>
            ) : (
              <ul className="divide-y">
                {serviceReviews.map((review, idx) => (
                  <li key={review._id || idx} className="py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{review.userId?.name || 'User'}</span>
                      <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                      <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mb-1 text-gray-700">{review.comment}</div>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-1">
                        {review.images.map((img: string, i: number) => (
                          <img key={i} src={img} alt="Review" className="w-12 h-12 object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
 