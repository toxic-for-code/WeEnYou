'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { getImageUrl } from '@/lib/imageUtils';

interface HallListProps {
  selectedHall: string | null;
  onHallSelect: (hallId: string) => void;
  filters: {
    location: string;
    date: string;
    capacity: string;
    priceRange: string;
    amenities: string[];
    minRating?: string;
    dateRangeStart?: string;
    dateRangeEnd?: string;
  };
}

export default function HallList({ selectedHall, onHallSelect, filters }: HallListProps) {
  const { data: session } = useSession();
  const [halls, setHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/wishlist')
        .then(res => res.json())
        .then(data => setWishlist(Array.isArray(data.wishlist) ? data.wishlist.map((h: any) => h._id) : []));
    }
  }, [session]);

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
          response = await fetch('/api/halls');
          data = await response.json();
        } else {
          const queryParams = new URLSearchParams({
            ...filters,
            amenities: filters.amenities.join(','),
          });
          if (filters.minRating) queryParams.set('minRating', filters.minRating);
          if (filters.dateRangeStart && filters.dateRangeEnd) {
            queryParams.set('dateRange', `${filters.dateRangeStart},${filters.dateRangeEnd}`);
          }
          response = await fetch(`/api/halls/search?${queryParams}`);
          data = await response.json();
        }
        
        setHalls(data.halls);
      } catch (error) {
        console.error('Error fetching halls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, [filters]);

  const handleWishlistToggle = async (hallId: string, isWishlisted: boolean) => {
    if (!session?.user) return;
    if (isWishlisted) {
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hallId }),
      });
      setWishlist((prev) => prev.filter((id) => id !== hallId));
    } else {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hallId }),
      });
      setWishlist((prev) => [...prev, hallId]);
    }
  };

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
              src={getImageUrl(hall.images[0] || '/placeholder.jpg')}
              alt={hall.name}
              fill
              className="object-cover"
            />
            {session?.user && (
              <button
                className={`absolute top-2 right-2 z-10 p-1 rounded-full bg-white shadow ${wishlist.includes(hall._id) ? 'text-red-500' : 'text-gray-400'}`}
                onClick={e => { e.stopPropagation(); handleWishlistToggle(hall._id, wishlist.includes(hall._id)); }}
                aria-label={wishlist.includes(hall._id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill={wishlist.includes(hall._id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                </svg>
              </button>
            )}
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-semibold">{hall.name}</h3>
                {typeof hall.distance === 'number' && (
                  <div className="text-xs text-gray-500 mb-1">{hall.distance.toFixed(1)} km away</div>
                )}
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
 