'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Map from '@/components/Map';
import HallList from '@/components/HallList';
import SearchFilters from '@/components/SearchFilters';

export default function HallsPage() {
  const searchParams = useSearchParams();
  const [selectedHall, setSelectedHall] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    date: searchParams.get('date') || '',
    capacity: searchParams.get('capacity') || '',
    priceRange: searchParams.get('priceRange') || '',
    amenities: searchParams.get('amenities')?.split(',') || [],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Find Your Perfect Venue</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <Map
                selectedHall={selectedHall}
                onHallSelect={setSelectedHall}
                filters={filters}
              />
            </div>

            <HallList
              selectedHall={selectedHall}
              onHallSelect={setSelectedHall}
              filters={filters}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
 