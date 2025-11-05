'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';

interface Hall {
  _id: string;
  name: string;
  images: string[];
  location: {
    city: string;
    state: string;
    address: string;
  };
  price: number;
  capacity: number;
}

export default function CityPage() {
  const params = useParams();
  const city = params.city as string;
  
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/${city}/banquet-halls`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch venues in ${city}`);
        }
        
        const data = await response.json();
        setHalls(data.halls || []);
      } catch (err) {
        console.error(`Error fetching venues in ${city}:`, err);
        setError(`Failed to load venues in ${city}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };
    
    if (city) {
      fetchData();
    }
  }, [city]);

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">All Venues in {cityName}</h1>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">All Venues in {cityName}</h1>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Venues in {cityName}</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Explore by Category</h2>
        <div className="flex flex-wrap gap-4">
          <Link href={`/${city}/banquet-halls`} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200">
            Banquet Halls
          </Link>
          <Link href={`/${city}/wedding-lawns`} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200">
            Wedding Lawns
          </Link>
          <Link href={`/${city}/venues`} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200">
            All Venues
          </Link>
          <Link href={`/${city}/vendors`} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200">
            Vendors
          </Link>
        </div>
      </div>
      
      {halls.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">No venues found in {cityName}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall) => (
            <div key={hall._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48 w-full">
                {hall.images && hall.images.length > 0 ? (
                  <Image
                    src={getImageUrl(hall.images[0])}
                    alt={hall.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{hall.name}</h2>
                <p className="text-gray-600 mb-2">{hall.location.address}</p>
                <p className="text-gray-800 font-medium mb-2">₹{hall.price.toLocaleString()} onwards</p>
                <p className="text-gray-600 mb-4">Capacity: {hall.capacity} guests</p>
                <Link 
                  href={`/halls/${hall._id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}