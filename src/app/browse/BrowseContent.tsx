'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import React from 'react';
import SearchFilters from '@/components/SearchFilters';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UsersIcon, 
  MagnifyingGlassIcon, 
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const BrowseMap = dynamic(() => import('@/components/BrowseMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center text-gray-400 font-bold">Loading Map...</div>
});
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Dialog, Transition } from '@headlessui/react';

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Rating: High to Low" },
];

export default function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [venues, setVenues] = useState<any[]>([]);
  const [page, setPage] = useState(Number(searchParams?.get('page') ?? '1') || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imgIndices, setImgIndices] = useState<number[]>([]);
  const [totalVenues, setTotalVenues] = useState(0);
  const [mapView, setMapView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sortOption, setSortOption] = useState('popularity');
  const [searchAsMove, setSearchAsMove] = useState(true);
  const [mapBounds, setMapBounds] = useState<{ sw: { lat: number; lng: number }; ne: { lat: number; lng: number } } | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hoveredVenueId, setHoveredVenueId] = useState<string | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [selectedMarkerVenue, setSelectedMarkerVenue] = useState<any | null>(null);
  const venueListRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  useEffect(() => {
    setMounted(true);
  }, []);

  const [filters, setFilters] = useState({
    location: searchParams?.get('city') || searchParams?.get('location') || searchParams?.get('q') || '',
    date: '',
    capacity: searchParams?.get('minCapacity') || '',
    priceRange: searchParams?.get('priceRange') || '',
    amenities: searchParams?.get('amenities')?.split(',') || [],
    minRating: searchParams?.get('minRating') || '',
    dateRangeStart: searchParams?.get('startDate') || searchParams?.get('dateRangeStart') || '',
    dateRangeEnd: searchParams?.get('endDate') || searchParams?.get('dateRangeEnd') || '',
  });

  // Sync state with URL when relevant params change
  useEffect(() => {
    setFilters({
      location: searchParams?.get('city') || searchParams?.get('location') || searchParams?.get('q') || '',
      date: '',
      capacity: searchParams?.get('minCapacity') || '',
      priceRange: searchParams?.get('priceRange') || '',
      amenities: searchParams?.get('amenities')?.split(',').filter(Boolean) || [],
      minRating: searchParams?.get('minRating') || '',
      dateRangeStart: searchParams?.get('startDate') || searchParams?.get('dateRangeStart') || '',
      dateRangeEnd: searchParams?.get('endDate') || searchParams?.get('dateRangeEnd') || '',
    });
    setPage(Number(searchParams?.get('page') ?? '1') || 1);
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.location) params.set('location', filters.location);
    if (filters.dateRangeStart) params.set('dateRangeStart', filters.dateRangeStart);
    if (filters.dateRangeEnd) params.set('dateRangeEnd', filters.dateRangeEnd);
    if (filters.capacity) params.set('minCapacity', filters.capacity);
    if (filters.priceRange) params.set('priceRange', filters.priceRange);
    if (filters.amenities.length > 0) params.set('amenities', filters.amenities.join(','));
    if (filters.minRating) params.set('minRating', filters.minRating);
    
    params.set('page', '1');
    router.push(`/browse?${params.toString()}`);
  };

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchParams?.get('city')) params.set('city', searchParams.get('city')!);
      if (searchParams?.get('location')) params.set('city', searchParams.get('location')!);
      if (searchParams?.get('q')) params.set('q', searchParams.get('q')!);
      if (searchParams?.get('minCapacity')) params.set('minCapacity', searchParams.get('minCapacity')!);
      if (searchParams?.get('priceRange')) params.set('priceRange', searchParams.get('priceRange')!);
      if (searchParams?.get('minRating')) params.set('minRating', searchParams.get('minRating')!);
      if (searchParams?.get('amenities')) params.set('amenities', searchParams.get('amenities')!);
      if (searchParams?.get('dateRangeStart')) params.set('startDate', searchParams.get('dateRangeStart')!);
      if (searchParams?.get('dateRangeEnd')) params.set('endDate', searchParams.get('dateRangeEnd')!);
      if (searchParams?.get('useMyLocation')) params.set('useMyLocation', searchParams.get('useMyLocation')!);
      if (searchParams?.get('lat')) params.set('lat', searchParams.get('lat')!);
      if (searchParams?.get('lng')) params.set('lng', searchParams.get('lng')!);
      params.set('page', page.toString());
      params.set('limit', '100');
      params.set('sort', sortOption);
      if (mapBounds) {
        params.set('swLat', mapBounds.sw.lat.toString());
        params.set('swLng', mapBounds.sw.lng.toString());
        params.set('neLat', mapBounds.ne.lat.toString());
        params.set('neLng', mapBounds.ne.lng.toString());
      }
      try {
        const res = await fetch(`/api/halls/search?${params.toString()}`);
        const data = await res.json();
        setVenues(data.venues || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalVenues(data.pagination?.total || 0);
      } catch (err) {
        console.error("Search fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, [searchParams, page, sortOption, mapBounds]);

  useEffect(() => {
    setImgIndices(Array(venues.length).fill(0));
  }, [venues]);

  useEffect(() => {
    if (!venues.length) return;
    const interval = setInterval(() => {
      setImgIndices(prev =>
        prev.map((idx, i) =>
          venues[i]?.images && venues[i].images.length > 1
            ? (idx + 1) % venues[i].images.length
            : 0
        )
      );
    }, 2500);
    return () => clearInterval(interval);
  }, [venues]);

  const handleMapMove = (bounds: any) => {
    setMapBounds(bounds);
    if (!searchAsMove) {
      setShowSearchThisArea(true);
    }
  };

  return (
    <div className="page-mobile-first min-h-screen bg-gray-50 font-sans relative">
      {/* 1. Compact Sticky Search Bar */}
      <div className="sticky top-0 z-30 w-full bg-white border-b border-gray-200 shadow-sm py-3 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500 transition-all shadow-inner w-full">
            <MapPinIcon className="w-5 h-5 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="City, Area or Venue" 
              className="bg-transparent border-none outline-none w-full text-sm sm:text-base font-medium text-gray-800"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto md:flex-1">
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500 transition-all shadow-inner">
              <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
              <div className="relative flex-1">
                <span className="text-sm sm:text-base font-medium text-gray-800">
                  {filters.dateRangeStart ? new Date(filters.dateRangeStart).toLocaleDateString() : 'Date'}
                </span>
                <input 
                  type="date" 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  value={filters.dateRangeStart}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRangeStart: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-500 transition-all shadow-inner">
              <UsersIcon className="w-5 h-5 text-gray-400 mr-2" />
              <select 
                className="bg-transparent border-none outline-none w-full text-sm sm:text-base font-medium text-gray-800 appearance-none"
                value={filters.capacity}
                onChange={(e) => setFilters(prev => ({ ...prev, capacity: e.target.value }))}
              >
                <option value="">Capacity</option>
                <option value="50">50+</option>
                <option value="100">100+</option>
                <option value="200">200+</option>
                <option value="500">500+</option>
                <option value="1000">1000+</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleSearch}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-8 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span>Search</span>
          </button>

          <button 
            className="lg:hidden flex items-center gap-2 text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm"
            onClick={() => setIsFilterOpen(true)}
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span className="text-sm font-semibold">Filters</span>
          </button>
        </div>
      </div>

      {/* 2. Mobile Filter Drawer */}
      <Transition show={isFilterOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={() => setIsFilterOpen(false)}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={React.Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative max-w-xs w-full bg-white shadow-xl pb-12 flex flex-col overflow-y-auto">
                <div className="px-4 pt-5 pb-2 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="p-2 -mr-2 text-gray-400"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <AdjustmentsHorizontalIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="border-t border-gray-200 py-6 px-4">
                  <SearchFilters filters={filters} setFilters={setFilters} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* 3. Main Content Grid */}
      <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 ${mapView ? 'lg:max-w-none lg:px-4' : ''}`}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Hidden when map is full screen on mobile, but let's keep it responsive */}
          <aside className={`flex-shrink-0 transition-all duration-300 ${mapView ? 'hidden xl:block w-72' : 'hidden lg:block w-80'}`}>
            <div className="sticky top-24">
              <SearchFilters filters={filters} setFilters={setFilters} />
            </div>
          </aside>
  
          {/* Main Content Area */}
          <main className={`flex-1 min-w-0 transition-all duration-300 ${mapView ? 'lg:flex lg:gap-4' : ''}`}>
            {/* List side - 60% approx */}
            <div className={`transition-all duration-300 ${mapView ? 'lg:w-[55%] xl:w-[60%] h-[calc(100vh-140px)] overflow-y-auto pr-2 custom-scrollbar' : 'w-full'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl md:text-4xl font-black text-primary-600 leading-none">{totalVenues}</span>
                <div className="flex flex-col">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">Venues Available</h2>
                  <span className="text-xs font-semibold text-gray-500">
                    in {filters.location || 'India'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Map View</span>
                  <button
                    className={`w-9 h-5 rounded-full flex items-center transition-all duration-300 focus:outline-none ${mapView ? 'bg-primary-600' : 'bg-gray-200'}`}
                    onClick={() => setMapView(v => !v)}
                  >
                    <span className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transform transition-transform duration-300 mx-0.5 ${mapView ? 'translate-x-4' : 'translate-x-0'}`}></span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort</span>
                  <select
                    className="bg-transparent border-none outline-none text-sm font-bold text-gray-900 cursor-pointer focus:ring-0 p-0"
                    value={sortOption}
                    onChange={e => setSortOption(e.target.value)}
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label.split(':')[0]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col justify-center items-center h-96 bg-white rounded-3xl shadow-sm border border-gray-100">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-gray-900 animate-pulse">Searching for premium venues...</h3>
                </div>
              ) : venues.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPinIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No venues found</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your filters or searching in a different area.</p>
                </div>
              ) : (
                  <div className="space-y-4">
                  {venues.map((hall, idx) => (
                    <div
                      key={hall._id}
                      ref={el => { venueListRef.current[hall._id] = el; }}
                      onMouseEnter={() => setHoveredVenueId(hall._id)}
                      onMouseLeave={() => setHoveredVenueId(null)}
                      className={`group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border transition-all duration-300 flex flex-col md:flex-row gap-0 md:gap-0 ${selectedVenueId === hall._id ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-100'}`}
                    >
                      <div className="relative w-full md:w-64 lg:w-72 aspect-[4/3] md:aspect-auto overflow-hidden flex-shrink-0">
                        <Image
                          src={hall.images?.[imgIndices[idx]] || "/placeholder.jpg"}
                          alt={hall.name || "Venue"}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          {hall.featured && (
                            <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg">Featured</span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className="text-lg md:text-xl font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">{hall.name}</h3>
                              <div className="flex items-center gap-1 bg-yellow-400 px-2 py-0.5 rounded-lg shrink-0">
                                <StarIconSolid className="w-3.5 h-3.5 text-black" />
                                <span className="text-xs font-black text-black">{(hall.averageRating || hall.rating || 0).toFixed(1)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <MapPinIcon className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                              <span className="text-xs font-medium line-clamp-1">{hall.location?.address || hall.location?.city || "Address on request"}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 py-3 border-y border-gray-50">
                            {hall.capacity && (
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
                                <UsersIcon className="w-4 h-4 text-gray-400" />
                                <span>Up to {hall.capacity} Guests</span>
                              </div>
                            )}
                            <div className="h-4 w-[1px] bg-gray-200" />
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
                              <CalendarIcon className="w-4 h-4 text-gray-400" />
                              <span>Instant Booking</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-end md:items-center justify-between pt-4 mt-2 gap-4">
                          <div className="flex flex-col w-full md:w-auto">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Total Package</span>
                            <span className="text-2xl font-black text-gray-900 leading-none">
                              ₹{(hall.price || 0).toLocaleString('en-IN')}
                              <span className="text-xs text-gray-400 font-bold ml-1">/event</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <button 
                              onClick={() => router.push(`/halls/${hall._id}`)} 
                              className="flex-1 md:flex-none border-2 border-gray-100 text-gray-900 hover:border-primary-100 hover:bg-primary-50 px-5 py-3 rounded-2xl text-xs font-extrabold transition-all"
                            >
                              Details
                            </button>
                            <button 
                              onClick={() => router.push(`/halls/${hall._id}/book`)}
                              className="flex-[2] md:flex-none bg-primary-600 text-white hover:bg-primary-700 px-6 py-3 rounded-2xl text-xs font-extrabold transition-all shadow-lg shadow-primary-200"
                            >
                              Reserve Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!loading && totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-4">
                <button
                  className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold disabled:opacity-50"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold disabled:opacity-50"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            </div>
  
            {/* Map side - Desktop Split View - 40% approx */}
            {mapView && mounted && (
              <div className="hidden lg:block lg:w-[45%] xl:w-[40%] h-[calc(100vh-140px)] sticky top-24 rounded-3xl overflow-hidden border border-gray-200 shadow-inner">
                 <BrowseMap 
                   venues={venues}
                   hoveredVenueId={hoveredVenueId}
                   selectedVenueId={selectedVenueId}
                   selectedMarkerVenue={selectedMarkerVenue}
                   setSelectedMarkerVenue={setSelectedMarkerVenue}
                   setSelectedVenueId={setSelectedVenueId}
                   onMove={handleMapMove}
                   showSearchThisArea={showSearchThisArea}
                   setShowSearchThisArea={setShowSearchThisArea}
                   venueListRef={venueListRef}
                 />
              </div>
            )}
          </main>
        </div>


        {mapView && mounted && (
          <div className="fixed inset-0 z-50 bg-white lg:hidden">
            <div className="absolute top-4 left-4 z-[60] bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
               <button onClick={() => setMapView(false)} className="p-2 bg-gray-100 rounded-full">
                 <ChevronLeftIcon className="w-5 h-5" />
               </button>
               <div className="flex items-center gap-2">
                 <input
                   type="checkbox"
                   checked={searchAsMove}
                   onChange={e => setSearchAsMove(e.target.checked)}
                   id="search-as-move-fab"
                   className="w-4 h-4 rounded border-gray-300 text-primary-600"
                 />
                 <label htmlFor="search-as-move-fab" className="text-xs font-bold text-gray-700">Search as I move</label>
               </div>
            </div>
            <div className="w-full h-full">
               <BrowseMap 
                 venues={venues}
                 hoveredVenueId={hoveredVenueId}
                 selectedVenueId={selectedVenueId}
                 selectedMarkerVenue={selectedMarkerVenue}
                 setSelectedMarkerVenue={setSelectedMarkerVenue}
                 setSelectedVenueId={setSelectedVenueId}
                 onMove={handleMapMove}
                 showSearchThisArea={showSearchThisArea}
                 setShowSearchThisArea={setShowSearchThisArea}
                 venueListRef={venueListRef}
                 isMobile={true}
                 setMapView={setMapView}
               />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
