'use client';

import Image from 'next/image';
import { MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';

interface VenueCardProps {
  hall: {
    _id: string;
    name: string;
    images?: string[];
    averageRating?: number;
    location?: {
      city: string;
      state?: string;
    };
    capacity?: number;
    amenities?: string[];
    price?: number;
    priceType?: string;
  };
  priority?: boolean;
}

export default function VenueCard({ hall, priority = false }: VenueCardProps) {
  return (
    <div className="snap-start shrink-0 w-[85vw] sm:w-[320px] md:w-[280px] bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl p-4 flex flex-col transition-all duration-300 hover:-translate-y-1 group">
      <div className="relative overflow-hidden rounded-xl mb-4 aspect-[4/3]">
        <Image
          src={hall.images && hall.images[0] ? hall.images[0] : '/placeholder.jpg'}
          alt={hall.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority={priority}
          sizes="(max-width: 640px) 85vw, (max-width: 768px) 320px, 280px"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-sm font-bold text-gray-800 flex items-center gap-1 shadow-sm">
          <svg className="w-4 h-4 text-[#C89B3C]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
          </svg>
          {hall.averageRating?.toFixed(1) || 'N/A'}
        </div>
      </div>
      
      <h3 className="font-bold text-lg text-gray-900 mb-1.5 truncate">{hall.name}</h3>
      <div className="text-gray-500 text-sm mb-3 flex items-center gap-1.5 truncate">
        <MapPinIcon className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="truncate">{hall.location?.city}{hall.location?.state ? `, ${hall.location.state}` : ''}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md shrink-0">
          <UsersIcon className="w-3.5 h-3.5 text-[#C89B3C]" />
          <span>{hall.capacity || 'N/A'} Guests</span>
        </div>
        {Array.isArray(hall.amenities) && hall.amenities.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-2 py-1 rounded-md shrink-0 truncate">
            <svg className="w-3.5 h-3.5 text-[#C89B3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="truncate">{hall.amenities[0]}</span>
          </div>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 font-medium">Starting from</div>
          <div className="text-base font-bold text-gray-900 flex items-baseline gap-1">
            ₹{hall.price ? hall.price.toLocaleString() : '--'} <span className="text-xs font-normal text-gray-500">{hall.priceType === 'per plate' ? '/ plate' : ''}</span>
          </div>
        </div>
        <a
          href={`/halls/${hall._id}`}
          className="bg-white border text-sm border-[#C89B3C] text-[#C89B3C] hover:bg-[#C89B3C] hover:text-white font-semibold py-1.5 px-4 rounded-lg transition-all shadow-sm"
        >
          View Details
        </a>
      </div>
    </div>
  );
}
