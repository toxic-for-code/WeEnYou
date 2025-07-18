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
  const { id } = useParams();
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

  const handleMessageOwner = async () => {
    if (!session || !hall.ownerId?._id) return;
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participants: [session.user.id, hall.ownerId._id],
        conversationType: 'hall_booking',
        hallId: hall._id,
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

  if (!hall) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Hall not found</h2>
        <p className="text-gray-600 mt-2">The hall you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Image Gallery */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-[400px]">
            <Image
              src={getImageUrl(hall.images[activeImage])}
              alt={hall.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4 flex space-x-4 overflow-x-auto">
            {hall.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden ${
                  activeImage === index ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <Image
                  src={getImageUrl(image)}
                  alt={`${hall.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hall Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{hall.name}</h1>
                  {hall.verified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                      <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-primary-600">₹{hall.price}/day</p>
                  <p className="text-sm text-gray-500">Capacity: {hall.capacity} people</p>
                </div>
              </div>

              {/* Owner Info */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-1">Owner Info</h2>
                <p className="text-gray-700">{hall.ownerId?.name} ({hall.ownerId?.email})</p>
                {session && session.user.id !== hall.ownerId?._id && (
                  <button
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleMessageOwner}
                  >
                    Message Owner
                  </button>
                )}
              </div>

              {/* Map */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Location</h2>
                <p className="text-gray-600">
                  {hall.location.address}, {hall.location.city}, {hall.location.state}
                </p>
                <div className="mt-4 rounded overflow-hidden" style={{ height: 300 }}>
                  {!isLoaded ? (
                    <div className="flex justify-center items-center h-full">Loading map...</div>
                  ) : (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={{
                        lat: hall.location.coordinates.coordinates[1],
                        lng: hall.location.coordinates.coordinates[0],
                      }}
                      zoom={15}
                      options={{ streetViewControl: false, mapTypeControl: false }}
                    >
                      <Marker
                        position={{
                          lat: hall.location.coordinates.coordinates[1],
                          lng: hall.location.coordinates.coordinates[0],
                        }}
                      />
                    </GoogleMap>
                  )}
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p>{hall.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {hall.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Services in this locality */}
              {services.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Available Services in this Locality</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map(service => (
                      <div key={service._id} className="border rounded-lg p-4 bg-gray-50 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                          {service.verified && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                                <circle cx="4" cy="4" r="3" />
                              </svg>
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Type: {service.serviceType}</p>
                        <p className="text-sm text-gray-600 mb-1">{service.description}</p>
                        <p className="text-sm text-gray-600 mb-1">Price: ₹{service.price}</p>
                        <p className="text-sm text-gray-600 mb-1">Contact: {service.contact}</p>
                        <p className="text-xs text-gray-400">{service.city}, {service.state}</p>
                        <button
                          className="mt-2 px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                          onClick={() => addToCart(service)}
                          disabled={!!cart.find(s => s._id === service._id)}
                        >
                          {cart.find(s => s._id === service._id) ? 'Added' : 'Add Service'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Cart */}
              {cart.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-3">Service Cart</h2>
                  <div className="space-y-2">
                    {cart.map(service => (
                      <div key={service._id} className="flex justify-between items-center border rounded px-3 py-2 bg-white">
                        <div>
                          <span className="font-medium">{service.name}</span>
                          <span className="ml-2 text-gray-500">₹{service.price}</span>
                        </div>
                        <button
                          className="text-red-600 hover:underline text-sm"
                          onClick={() => removeFromCart(service._id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-right font-bold text-lg">
                    Total: ₹{totalPrice}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold mb-3">Reviews</h2>
                <div className="space-y-4">
                  {hall.reviews.map((review) => (
                    <div key={review.userId} className="border-b pb-4 last:border-0">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
                {/* Add Review Form */}
                {session && session.user.id !== hall.ownerId?._id && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Add a Review</h3>
                    <ReviewForm hallId={hall._id} />
                  </div>
                )}
              </div>
            </div>
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
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <div>
        <label className="block font-medium mb-1">Rating</label>
        <select
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          className="border rounded px-2 py-1"
        >
          {[5,4,3,2,1].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-1">Comment</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="border rounded px-2 py-1 w-full"
          rows={3}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
} 
 