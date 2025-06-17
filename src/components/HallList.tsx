'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HallListProps {
  selectedHall: string | null;
  onHallSelect: (hallId: string) => void;
  filters: {
    location: string;
    date: string;
    capacity: string;
    priceRange: string;
    amenities: string[];
  };
}

export default function HallList({ selectedHall, onHallSelect, filters }: HallListProps) {
  const [halls, setHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        const isFiltersEmpty =
          !filters.location &&
          !filters.date &&
          !filters.capacity &&
          !filters.priceRange &&
          (!filters.amenities || filters.amenities.length === 0);

        let response, data;
        if (isFiltersEmpty) {
          console.log('Fetching all halls...');
          response = await fetch('/api/halls');
          data = await response.json();
          console.log('Received halls data:', data.halls);
        } else {
          console.log('Fetching filtered halls...');
          const queryParams = new URLSearchParams({
            ...filters,
            amenities: filters.amenities.join(','),
          });
          response = await fetch(`/api/halls/search?${queryParams}`);
          data = await response.json();
          console.log('Received filtered halls data:', data.halls);
        }
        
        // Log each hall's verification status
        data.halls.forEach((hall: any) => {
          console.log(`Hall ${hall.name} verification status:`, typeof hall.verified, hall.verified);
        });
        
        setHalls(data.halls);
      } catch (error) {
        console.error('Error fetching halls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (halls.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No halls found</h3>
        <p className="text-gray-600">Try adjusting your filters to find more options.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {halls.map((hall) => (
        <div
          key={hall._id}
          className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${
            selectedHall === hall._id ? 'ring-2 ring-primary-500' : ''
          }`}
          onClick={() => onHallSelect(hall._id)}
        >
          <div className="relative h-48">
            <Image
              src={hall.images[0] || '/placeholder.jpg'}
              alt={hall.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-semibold">{hall.name}</h3>
                {hall.verified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              <span className="text-primary-600 font-semibold">₹{hall.price}/day</span>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-2">{hall.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  <i className="fas fa-users mr-1"></i>
                  {hall.capacity} people
                </span>
                <span className="text-sm text-gray-500">
                  <i className="fas fa-star mr-1 text-yellow-400"></i>
                  {(hall.rating ?? 0).toFixed(1)}
                </span>
              </div>
              <Link
                href={`/halls/${hall._id}`}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 