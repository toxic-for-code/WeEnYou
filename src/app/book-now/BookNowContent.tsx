'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import Image from 'next/image';

export default function BookNowContent() {
  const searchParams = useSearchParams();
  const hallId = searchParams?.get('hall') ?? null;
  const [hall, setHall] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hallId) {
      setLoading(true);
      fetch(`/api/halls/${hallId}`)
        .then(res => res.json())
        .then(data => setHall(data.hall))
        .catch(() => setError('Failed to load hall details'))
        .finally(() => setLoading(false));
    }
  }, [hallId]);

  if (!hallId) {
    return <div className="page-mobile-first container mx-auto px-4 py-8 text-center sm:text-left">No hall selected. Please select a hall to book.</div>;
  }

  if (loading) {
    return <div className="page-mobile-first container mx-auto px-4 py-8">Loading...</div>;
  }

  if (error) {
    return <div className="page-mobile-first container mx-auto px-4 py-8 text-red-600">{error}</div>;
  }

  if (!hall) {
    return <div className="page-mobile-first container mx-auto px-4 py-8">Hall not found.</div>;
  }

  return (
    <div className="page-mobile-first container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-2xl w-full min-w-0">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Book Now</h1>
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative w-32 h-32 flex-shrink-0">
          <Image src={hall.images[0]} alt={hall.name} fill className="object-cover rounded-lg" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{hall.name}</h2>
          <p className="text-gray-600">{hall.location.address}, {hall.location.city}, {hall.location.state}</p>
          <p className="text-gray-600">Capacity: {hall.capacity}</p>
          <p className="text-gray-600">Price: ₹{hall.price}</p>
        </div>
      </div>
      <BookingForm 
        hallId={hall._id} 
        price={hall.price} 
        services={[]} 
        servicesTotal={0} 
        capacity={hall.capacity}
      />
    </div>
  );
}
