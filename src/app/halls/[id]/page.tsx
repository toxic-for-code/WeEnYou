'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import BookingForm from '@/components/BookingForm';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { getImageUrl } from '@/lib/imageUtils';

interface Hall {
  _id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  capacity: number;
  amenities: string[];
  rating: number;
  reviews: {
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: {
      type: string;
      coordinates: number[];
    };
  };
  ownerId: {
    _id: string;
    name: string;
    email: string;
  };
  verified: boolean;
  platformFeePercent?: number;
}

interface Service {
  _id: string;
  serviceType: string;
  name: string;
  description: string;
  price: number;
  contact: string;
  city: string;
  state: string;
  verified: boolean;
}

export default function HallDetail() {
  const params = useParams();
  const id = (params as any)?.id as string;
  const { data: session } = useSession();
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [cart, setCart] = useState<Service[]>([]);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });
  const router = useRouter();

  useEffect(() => {
    const fetchHall = async () => {
      try {
        const response = await fetch(`/api/halls/${id}`);
        const data = await response.json();
        setHall(data.hall);
        // Fetch services for the hall's city
        if (data.hall?.location?.city) {
          const res = await fetch(`/api/services?city=${encodeURIComponent(data.hall.location.city)}`);
          const serviceData = await res.json();
          setServices(serviceData.services || []);
        }
      } catch (error) {
        console.error('Error fetching hall:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHall();
  }, [id]);

  // Add service to cart
  const addToCart = (service: Service) => {
    if (!cart.find(s => s._id === service._id)) {
      setCart([...cart, service]);
    }
  };
  // Remove service from cart
  const removeFromCart = (serviceId: string) => {
    setCart(cart.filter(s => s._id !== serviceId));
  };
  const totalPrice = cart.reduce((sum, s) => sum + s.price, 0);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Venue Not Found</h2>
        <p className="text-gray-500 font-medium max-w-md">The hall you're looking for doesn't exist or has been removed. Explore our other premium venues.</p>
        <button onClick={() => router.push('/halls')} className="mt-8 px-8 py-3 bg-primary-600 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
          Browse Venues
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {hall.verified && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    Verified Venue
                  </span>
                )}
                  {hall.reviews?.length > 0 ? (
                    <>
                      <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      <span className="text-sm font-black text-gray-900">{hall.rating}</span>
                      <span className="text-sm font-medium text-gray-400">({hall.reviews.length} reviews)</span>
                    </>
                  ) : (
                    <span className="text-sm font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">New Venue</span>
                  )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                {hall.name}
              </h1>
              <p className="text-gray-500 font-bold flex items-center gap-1 text-sm uppercase tracking-tighter">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {hall.location.address}, {hall.location.city}
              </p>
            </div>
          </div>

          {/* Hero Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[420px] rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 group">
            <div className="md:col-span-3 relative h-[260px] md:h-full overflow-hidden">
              <Image
                src={getImageUrl(hall.images[activeImage])}
                alt={hall.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                priority
              />
            </div>
            <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {hall.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-[4/3] rounded-2xl overflow-hidden transition-all duration-300 ${
                    activeImage === idx ? 'ring-4 ring-primary-500 scale-95' : 'hover:scale-95 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={getImageUrl(img)} alt={`Gallery ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
            {/* Mobile Thumbnails */}
            <div className="flex md:hidden gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {hall.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden ${
                    activeImage === idx ? 'ring-2 ring-primary-500' : 'opacity-60'
                  }`}
                >
                  <Image src={getImageUrl(img)} alt={`Gallery ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container mx-auto px-4 mt-8 md:mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Overview Section */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/20">
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <span className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                Venue Overview
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Capacity</span>
                  <span className="text-sm font-black text-gray-900">{hall.capacity} Guests</span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Location</span>
                  <span className="text-sm font-black text-gray-900">{hall.location.city}, {hall.location.state}</span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Owner</span>
                  <span className="text-sm font-black text-gray-900">{hall.ownerId?.name || 'Verified Partner'}</span>
                </div>
              </div>
              <div className="prose max-w-none text-gray-600 font-medium leading-relaxed">
                {hall.description}
              </div>
            </section>

            {/* Amenities Section */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/20">
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
                </span>
                Featured Amenities
              </h2>
              <div className="flex flex-wrap gap-3">
                {hall.amenities.map((item) => (
                  <span key={item} className="px-5 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-black border border-gray-100 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all cursor-default">
                    {item}
                  </span>
                ))}
              </div>
            </section>

            {/* Map Section */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                <span className="p-2 bg-red-50 text-red-600 rounded-xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </span>
                Location
              </h2>
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-inner h-[320px]">
                {!isLoaded ? (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center animate-pulse text-gray-400 font-bold">Loading Map...</div>
                ) : (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={{ lat: hall.location.coordinates.coordinates[1], lng: hall.location.coordinates.coordinates[0] }}
                    zoom={15}
                    options={{ disableDefaultUI: true, zoomControl: true, styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }] }}
                  >
                    <Marker position={{ lat: hall.location.coordinates.coordinates[1], lng: hall.location.coordinates.coordinates[0] }} />
                  </GoogleMap>
                )}
              </div>
              <p className="mt-4 text-gray-500 font-bold text-sm uppercase tracking-tighter">
                {hall.location.address}, {hall.location.city}, {hall.location.state}
              </p>
            </section>

            {/* Nearby Services */}
            {services.length > 0 && (
              <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/20">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                    <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </span>
                    Nearby Services
                  </h2>
                </div>
                <div className="flex overflow-x-auto gap-4 pb-4 -mx-1 px-1 custom-scrollbar">
                  {services.map(service => (
                    <div key={service._id} className="min-w-[280px] bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-3 group/card overflow-hidden relative">
                      {service.verified && (
                        <div className="absolute -top-1 -right-1 p-2 bg-green-500 text-white rounded-bl-xl shadow-lg">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"/></svg>
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{service.serviceType}</span>
                        <h3 className="font-black text-gray-900 group-hover/card:text-primary-600 transition-colors leading-tight truncate mt-0.5">{service.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">{service.description}</p>
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-200/50">
                        <span className="text-sm font-black text-gray-900">₹{service.price}</span>
                        <button
                          onClick={() => addToCart(service)}
                          disabled={!!cart.find(s => s._id === service._id)}
                          className="px-4 py-2 bg-white border-2 border-primary-600 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 hover:text-white transition-all disabled:opacity-30"
                        >
                          {cart.find(s => s._id === service._id) ? 'Added' : 'Add Service'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews Section */}
            <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <span className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  </span>
                  Community Reviews
                </h2>
                <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-6 py-4 border border-gray-100">
                  <div className="text-center">
                    <span className="block text-3xl font-black text-gray-900 leading-none">{hall.reviews?.length > 0 ? (hall.rating || '0') : 'N/A'}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Average</span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="text-center">
                    <span className="block text-3xl font-black text-gray-900 leading-none">{hall.reviews?.length || 0}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Written</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                {hall.reviews.map((review, idx) => (
                  <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <p className="text-gray-600 font-medium leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>

              {/* Add Review Form */}
              {session && session.user.id !== hall.ownerId?._id && (
                <div className="pt-8 border-t border-gray-100">
                  <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Post a Review</h3>
                  <ReviewForm hallId={hall._id} />
                </div>
              )}
            </section>
          </div>

          {/* Right Column (Booking Form Sticky) */}
          <div className="lg:col-span-4 relative mt-8 lg:mt-0">
            <BookingForm 
              hallId={hall._id} 
              price={hall.price} 
              capacity={hall.capacity} 
              services={cart} 
              servicesTotal={totalPrice} 
              platformFeePercent={hall.platformFeePercent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ReviewForm component
function ReviewForm({ hallId }: { hallId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`/api/halls/${hallId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add review');
      setSuccess('Review added!');
      setComment('');
      setRating(5);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/20">
      {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-black rounded-2xl border border-red-100">{error}</div>}
      {success && <div className="p-4 bg-green-50 text-green-600 text-sm font-black rounded-2xl border border-green-100">{success}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your Rating</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                className={`p-2 rounded-xl transition-all ${
                  rating >= r ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-300'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Share your experience</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all min-h-[120px]"
          placeholder="What did you love about this venue?"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-8 py-4 bg-primary-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Post Review'}
      </button>
    </form>
  );
}
 
 