'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  verified: boolean;
  bookings: Booking[];
  services: Service[];
}

interface Booking {
  _id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
}

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
}

export default function AdminHallDetails({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchHallDetails();
    }
  }, [session, status, router, params.id]);

  const fetchHallDetails = async () => {
    try {
      const response = await fetch(`/api/halls/${params.id}`);
      const data = await response.json();
      setHall(data.hall);
    } catch (error) {
      console.error('Error fetching hall details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hall) {
    return <div>Hall not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{hall.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="relative h-64 mb-4">
            <Image
              src={hall.images[0] || '/placeholder.jpg'}
              alt={hall.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <p className="text-gray-600">{hall.description}</p>
          <p className="text-gray-600">Location: {hall.location.city}, {hall.location.state}</p>
          <p className="text-gray-600">Price: ₹{hall.price}/day</p>
          <p className="text-gray-600">Capacity: {hall.capacity}</p>
          <p className="text-gray-600">Verified: {hall.verified ? 'Yes' : 'No'}</p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Bookings</h2>
          {!hall.bookings || hall.bookings.length === 0 ? (
            <p>No bookings found</p>
          ) : (
            <ul className="space-y-4">
              {hall.bookings.map((booking) => (
                <li key={booking._id} className="bg-white p-4 rounded-lg shadow">
                  <p>Start Date: {new Date(booking.startDate).toLocaleDateString()}</p>
                  <p>End Date: {new Date(booking.endDate).toLocaleDateString()}</p>
                  <p>Total Price: ₹{booking.totalPrice}</p>
                  <p>Status: {booking.status}</p>
                  <p>Payment Status: {booking.paymentStatus}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Services</h2>
          {!hall.services || hall.services.length === 0 ? (
            <p>No services found</p>
          ) : (
            <ul className="space-y-4">
              {hall.services.map((service) => (
                <li key={service._id} className="bg-white p-4 rounded-lg shadow">
                  <p className="font-semibold">{service.name}</p>
                  <p>{service.description}</p>
                  <p>Price: ₹{service.price}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 