'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';

interface Venue {
  _id: string;
  name: string;
  price: number;
  capacity: number;
  images: string[];
  location: { city: string };
  averageRating: number;
}

export default function SimilarVenues({ city, currentHallId, capacity }: { city: string, currentHallId: string, capacity: number }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        // Simple search for same city + similar capacity
        const res = await fetch(`/api/halls/search?city=${city}&capacity=${capacity}`);
        const data = await res.json();
        if (data.halls) {
          // Filter out current hall and take 3
          const filtered = data.halls
            .filter((h: Venue) => h._id !== currentHallId)
            .slice(0, 3);
          setVenues(filtered);
        }
      } catch (err) {
        console.error('Error fetching similar venues:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSimilar();
  }, [city, currentHallId, capacity]);

  if (loading) return (
    <div className="space-y-4 pt-6">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Loading Similar Venues...</h3>
      {[1, 2].map(i => (
        <div key={i} className="h-24 bg-gray-50 rounded-3xl animate-pulse" />
      ))}
    </div>
  );

  if (venues.length === 0) return null;

  return (
    <div className="space-y-4 pt-6">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Similar Venues in {city}</h3>
      <div className="space-y-3">
        {venues.map((v) => (
          <Link key={v._id} href={`/halls/${v._id}`}>
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden relative flex-shrink-0">
                <Image 
                  src={v.images?.[0] || '/placeholder-venue.jpg'} 
                  alt={v.name} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h4 className="text-xs font-black text-gray-900 truncate uppercase tracking-tighter mb-1">{v.name}</h4>
                <div className="flex items-center gap-2 mb-1">
                   <div className="flex items-center text-yellow-500">
                      <StarIcon className="w-3 h-3" />
                      <span className="text-[10px] font-black ml-0.5">{v.averageRating || '5.0'}</span>
                   </div>
                   <span className="text-[9px] font-bold text-gray-400 flex items-center gap-0.5">
                      <MapPinIcon className="w-2.5 h-2.5" /> {v.location.city}
                   </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-primary-600">₹{v.price.toLocaleString()}</span>
                  <span className="text-[9px] font-bold text-gray-400">up to {v.capacity} guests</span>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
