'use client';

import { useState, useEffect } from 'react';
import VenueCard from '@/components/VenueCard';

export default function VenuesPage() {
  const [halls, setHalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllFeaturedHalls = async () => {
      try {
        setLoading(true);
        // Fetch all featured venues using our newly updated API param
        const res = await fetch('/api/halls/featured?limit=all');
        
        if (!res.ok) {
          setHalls([]);
          return;
        }
        
        const data = await res.json();
        setHalls(data.halls || []);
      } catch (error) {
        console.error('Failed to fetch venues:', error);
        setHalls([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllFeaturedHalls();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-12 px-6 sm:px-10 lg:px-16 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Featured Venues</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Explore all featured venues available on WeEnYou. Handpicked spaces for your next big event.
        </p>
      </section>

      {/* Venues Grid */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mt-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-80 w-full shrink-0"></div>
            ))}
          </div>
        ) : halls.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Featured Venues</h2>
            <p className="text-gray-500">We are currently updating our featured listings. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {halls.map((hall, i) => (
              <div key={hall._id || i} className="flex justify-center">
                <VenueCard hall={hall} priority={i < 4} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
