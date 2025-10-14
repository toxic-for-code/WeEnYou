'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleMap, Marker, useJsApiLoader, type GoogleMap as GoogleMapType } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import React, { useRef } from 'react';
import SearchFilters from '@/components/SearchFilters';

const eventTypes = ["Wedding", "Birthday", "Corporate", "Engagement", "Anniversary"];
const capacities = [50, 100, 200, 500, 1000];
const priceRanges = [
  { id: "0-10000", label: "Under ₹10,000" },
  { id: "10000-25000", label: "₹10,000 - ₹25,000" },
  { id: "25000-50000", label: "₹25,000 - ₹50,000" },
  { id: "50000+", label: "Above ₹50,000" },
];
const ratings = [5, 4, 3, 2, 1];
const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Rating: High to Low" },
];

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

export default function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [venues, setVenues] = useState<any[]>([]);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imgIndices, setImgIndices] = useState<number[]>([]);
  const [totalVenues, setTotalVenues] = useState(0);
  const [mapView, setMapView] = useState(false); // Default to list only
  const [sortOption, setSortOption] = useState('popularity');
  const [searchAsMove, setSearchAsMove] = useState(true);
  const [mapBounds, setMapBounds] = useState(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const clustererRef = useRef(null);

  // Filter state for SearchFilters
  const [filters, setFilters] = useState({
    location: searchParams.get('city') || '',
    date: '',
    capacity: '',
    priceRange: '',
    amenities: [],
    minRating: '',
    dateRangeStart: searchParams.get('dateRangeStart') || '',
    dateRangeEnd: searchParams.get('dateRangeEnd') || '',
  });

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      // Forward all relevant filters from the page URL to the API
      if (searchParams.get('city')) params.set('city', searchParams.get('city')!);
      if (searchParams.get('location')) params.set('city', searchParams.get('location')!);
      if (searchParams.get('q')) params.set('q', searchParams.get('q')!);
      if (searchParams.get('minCapacity')) params.set('minCapacity', searchParams.get('minCapacity')!);
      if (searchParams.get('priceRange')) params.set('priceRange', searchParams.get('priceRange')!);
      if (searchParams.get('minRating')) params.set('minRating', searchParams.get('minRating')!);
      if (searchParams.get('amenities')) params.set('amenities', searchParams.get('amenities')!);
      if (searchParams.get('dateRangeStart')) params.set('startDate', searchParams.get('dateRangeStart')!);
      if (searchParams.get('dateRangeEnd')) params.set('endDate', searchParams.get('dateRangeEnd')!);
      if (searchParams.get('useMyLocation')) params.set('useMyLocation', searchParams.get('useMyLocation')!);
      if (searchParams.get('lat')) params.set('lat', searchParams.get('lat')!);
      if (searchParams.get('lng')) params.set('lng', searchParams.get('lng')!);
      params.set('page', page.toString());
      params.set('limit', '100');
      params.set('sort', sortOption);
      if (mapBounds) {
        params.set('swLat', mapBounds.sw.lat);
        params.set('swLng', mapBounds.sw.lng);
        params.set('neLat', mapBounds.ne.lat);
        params.set('neLng', mapBounds.ne.lng);
      }
      const res = await fetch(`/api/halls/search?${params.toString()}`);
      const data = await res.json();
      setVenues(data.venues || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalVenues(data.pagination?.total || 0);
      setLoading(false);
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

  // Map onIdle handler
  const handleMapIdle = () => {
    if (!mapRef.current) return;
    if (!searchAsMove) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    setMapBounds({ sw: { lat: sw.lat(), lng: sw.lng() }, ne: { lat: ne.lat(), lng: ne.lng() } });
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // After venues or map load, create markers and cluster them
  React.useEffect(() => {
    if (!isLoaded || !mapRef.current) return;
    // Remove old markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }
    // Create new markers
    const newMarkers = (venues || []).filter(hall => hall.geo && hall.geo.coordinates).map(hall => {
      return new window.google.maps.Marker({
        position: { lat: hall.geo.coordinates[1], lng: hall.geo.coordinates[0] },
        title: hall.name,
      });
    });
    markersRef.current = newMarkers;
    if (mapRef.current && newMarkers.length > 0) {
      clustererRef.current = new MarkerClusterer({
        markers: newMarkers,
        map: mapRef.current,
      });
    }
  }, [isLoaded, venues]);

  // Layout: split view
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-white to-gray-50 font-sans relative overflow-x-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <svg width="100%" height="100%" className="opacity-10 animate-pulse" style={{position:'absolute',top:0,left:0}}>
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="2" fill="#fbbf24" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>
      {/* Hero Section */}
      <div className="relative w-full h-64 sm:h-72 md:h-96 flex items-center justify-center mb-6 sm:mb-10 overflow-hidden rounded-b-3xl shadow-lg">
        {/* Background Image */}
        <Image
          src="/bg.png"
          alt="Browse Venues"
          fill
          className="object-cover object-center absolute inset-0 w-full h-full z-0"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/20 z-10" />
        {/* Content */}
        <div className="relative z-20 text-center px-4 sm:px-6 flex flex-col items-center justify-center w-full h-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold text-white drop-shadow-lg mb-3 sm:mb-4 animate-fade-in leading-tight">
            Find the Perfect Venue for Your Event
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-2xl text-gray-200 mb-4 sm:mb-6 max-w-2xl mx-auto animate-fade-in delay-100 leading-relaxed">
            Discover, compare, and book top-rated banquet halls with ease. Make your event unforgettable!
          </p>
          <a
            href="#venues"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-10 rounded-full shadow-lg transition-all duration-200 text-base sm:text-lg lg:text-xl animate-fade-in delay-200"
          >
            Start Browsing
          </a>
        </div>
      </div>
      {/* Filter and Results Section - Full Edge-to-Edge Split */}
      <div className={`flex w-full min-h-screen flex-1 ${mapView ? 'flex-row' : 'flex-col lg:flex-row'} gap-0`}>
        {/* Filters Sidebar (hide in mapView) */}
        {!mapView && (
          <aside className="w-full lg:w-80 flex-shrink-0 bg-white shadow-md border-r border-gray-200 p-4 sm:p-6 min-h-full h-auto">
            <SearchFilters filters={filters} setFilters={setFilters} />
          </aside>
        )}
        {/* Listings/Results (split in mapView) */}
        <main className={`flex-1 flex flex-col p-4 sm:p-6 ${mapView ? 'w-1/2 max-w-[50vw]' : ''}`} style={mapView ? { minWidth: 0 } : {}}>
          {/* Top Bar: Results count, Map View toggle, Sort By dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{totalVenues} Results Found</div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {/* Map View Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Map View</span>
                <button
                  className={`w-8 h-5 sm:w-10 sm:h-6 rounded-full border-2 border-blue-400 flex items-center transition-colors duration-200 focus:outline-none bg-white ${mapView ? 'bg-blue-100' : ''}`}
                  onClick={() => setMapView(v => !v)}
                >
                  <span className={`w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-full shadow transform transition-transform duration-200 ${mapView ? 'translate-x-3 sm:translate-x-4' : ''}`}></span>
                </button>
              </div>
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Sort By</span>
                <select
                  className="border rounded px-2 py-1 sm:px-3 text-gray-700 font-semibold focus:outline-none text-sm sm:text-base"
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value)}
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Rating: High to Low</option>
                </select>
              </div>
            </div>
          </div>
          {/* List Section */}
          <div className={mapView ? "overflow-y-auto max-h-[80vh] pr-2" : "pr-2"}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No banquet halls found</h3>
                <p className="text-gray-600">Try adjusting your filters to find more options.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-0" id="venues">
                {venues.map((hall, idx) => (
                  <React.Fragment key={hall._id}>
                    <div
                      className={`flex flex-col sm:flex-row items-stretch bg-white rounded-2xl shadow-md hover:shadow-2xl hover:scale-[1.01] hover:bg-gray-50 transition-all duration-200 overflow-hidden border border-gray-100 relative group mb-0 ${mapView ? 'p-2 gap-2 min-h-[120px]' : 'p-3 sm:p-4 gap-3 sm:gap-4'}`}
                    >
                      {/* Main image and thumbnails */}
                      <div className={mapView ? "flex flex-row sm:flex-col w-32 sm:w-32 flex-shrink-0" : "flex flex-row sm:flex-col w-full sm:w-64 flex-shrink-0"}>
                        <div className={mapView ? "relative w-24 sm:w-full h-20 sm:h-24" : "relative w-32 sm:w-40 md:w-full h-24 sm:h-32 md:h-40"}>
                          <Image
                            src={hall.images?.[imgIndices[idx]] || "/placeholder.jpg"}
                            alt={hall.name || "Venue"}
                            fill
                            className={mapView ? "object-cover rounded-xl" : "object-cover group-hover:brightness-90 transition-all duration-300 rounded-xl"}
                          />
                          {/* Featured Badge */}
                          {hall.featured && (
                            <span className={`absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-pink-400 text-white font-bold rounded shadow-lg z-20 animate-bounce ${mapView ? 'text-[10px] px-1 py-0.5' : 'text-xs px-2 py-1'}`}>Featured</span>
                          )}
                          {/* Verified Badge */}
                          {hall.verified && (
                            <span className={`absolute top-2 right-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold rounded shadow-lg z-20 flex items-center gap-1 animate-pulse ${mapView ? 'text-[10px] px-1 py-0.5' : 'text-xs px-2 py-1'}`}> 
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              Verified
                            </span>
                          )}
                        </div>
                        {/* Thumbnails */}
                        {hall.images && hall.images.length > 1 && (
                          <div className={`flex flex-row gap-1 ${mapView ? 'p-1' : 'p-2'} overflow-x-auto`}>
                            {hall.images.slice(0, 2).map((img, tIdx) => (
                              <button key={img} className={`w-8 h-6 rounded border-2 ${imgIndices[idx] === tIdx ? 'border-primary-600' : 'border-gray-200'} overflow-hidden`} onClick={() => setImgIndices(prev => prev.map((v, i) => i === idx ? tIdx : v))}>
                                <Image src={img} alt="thumb" width={32} height={24} className="object-cover w-full h-full rounded-md" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Details and actions */}
                      <div className={mapView ? "flex-1 flex flex-col sm:flex-row justify-between p-2 gap-2" : "flex-1 flex flex-col sm:flex-row justify-between p-3 sm:p-4 gap-3 sm:gap-4"}>
                        {/* Center: Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className={`${mapView ? 'text-sm sm:text-base font-semibold' : 'text-lg sm:text-xl font-semibold'} text-gray-900 truncate mb-1`} title={hall.name}>
                            {hall.name ? hall.name.charAt(0).toUpperCase() + hall.name.slice(1) : "Venue Name"}
                          </h3>
                          {hall.description && !mapView && (
                            <div className="text-xs sm:text-sm text-gray-600 truncate mb-1">{hall.description}</div>
                          )}
                          <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mb-1">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /></svg>
                            <span className="truncate">{hall.location?.address ? hall.location.address.charAt(0).toUpperCase() + hall.location.address.slice(1) : (hall.location?.city ? hall.location.city.charAt(0).toUpperCase() + hall.location.city.slice(1) : "Location not specified")}</span>
                            {/* Map link */}
                            {hall.location?.address && (
                              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hall.location.address)}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary-600 underline text-xs flex-shrink-0">View on Map</a>
                            )}
                          </div>
                          {/* Capacity, Hall Type, Event Types, Contact, Catering, Parking */}
                          <div className={`flex flex-wrap items-center gap-1 mb-1 ${mapView ? 'text-xs' : 'text-xs'}`}>
                            {hall.capacity && (
                              <span className="inline-flex items-center gap-1 bg-blue-50 px-1 py-0.5 rounded text-blue-700 font-medium">👥 {hall.capacity}</span>
                            )}
                            {hall.hallType && (
                              <span className="inline-flex items-center gap-1 bg-purple-50 px-1 py-0.5 rounded text-purple-700 font-medium">🏢 {hall.hallType}</span>
                            )}
                            {hall.eventTypes && hall.eventTypes.length > 0 && (
                              <span className="inline-flex items-center gap-1 bg-pink-50 px-1 py-0.5 rounded text-pink-700 font-medium">🎉 {hall.eventTypes.join(', ')}</span>
                            )}
                            {hall.managerName && (
                              <span className="inline-flex items-center gap-1 bg-green-50 px-1 py-0.5 rounded text-green-700 font-medium">👤 {hall.managerName}</span>
                            )}
                            {hall.cateringOptions && (
                              <span className="inline-flex items-center gap-1 bg-yellow-50 px-1 py-0.5 rounded text-yellow-700 font-medium">🍽️ {hall.cateringOptions}</span>
                            )}
                            {hall.parkingInfo && (
                              <span className="inline-flex items-center gap-1 bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-medium">🅿️ {hall.parkingInfo}</span>
                            )}
                          </div>
                          {/* Amenities icons/text */}
                          {hall.amenities && hall.amenities.length > 0 && (
                            <div className={`flex flex-wrap gap-1 mt-1 mb-1 ${mapView ? 'text-[11px]' : ''}`}>
                              {hall.amenities.slice(0, mapView ? 2 : 4).map(am => (
                                <span key={am} className="inline-flex items-center gap-1 bg-gray-100 px-1 py-0.5 rounded text-gray-700 font-medium">
                                  {/* Example icons for WiFi, Parking, AC, TV */}
                                  {am.toLowerCase().includes('wifi') && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.53 16.11a3.001 3.001 0 016.94 0M5.07 13.07a9 9 0 0113.86 0M1.64 9.64a15 15 0 0120.72 0M12 20h.01" /></svg>}
                                  {am.toLowerCase().includes('parking') && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17v-6a4 4 0 118 0v6M6 21h12" /></svg>}
                                  {am.toLowerCase().includes('ac') && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8h18M3 16h18M4 12h16" /></svg>}
                                  {am.toLowerCase().includes('tv') && <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="14" x="2" y="5" rx="2" /><path d="M8 21h8" /></svg>}
                                  {am}
                                </span>
                              ))}
                              {hall.amenities.length > (mapView ? 2 : 4) && <span className="text-xs text-gray-400">+ {hall.amenities.length - (mapView ? 2 : 4)} more</span>}
                            </div>
                          )}
                          {/* Rating */}
                          <div className={`flex items-center gap-1 mt-1 ${mapView ? 'text-xs' : ''}`}>
                            <span className="flex items-center gap-1">
                              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                              {(typeof hall.averageRating === 'number' ? hall.averageRating : hall.rating ?? 0).toFixed(1)}
                            </span>
                          </div>
                        </div>
                        {/* Right: Price and actions */}
                        <div className={`flex flex-col items-end justify-between ${mapView ? 'min-w-[100px] gap-1' : 'min-w-[140px] sm:min-w-[160px] gap-2'}`}>
                          <div className="flex flex-col items-end">
                            <span className={mapView ? "text-sm sm:text-base font-bold text-primary-700" : "text-lg sm:text-xl lg:text-2xl font-bold text-primary-700"}>
                              {typeof hall.price === 'number'
                                ? `₹${(hall.price + (hall.price * (typeof hall.platformFeePercent === 'number' ? hall.platformFeePercent : 10) / 100)).toLocaleString('en-IN')}`
                                : (typeof hall.price === 'string' && hall.price.replace(/[^\d]/g, '').length > 0
                                  ? `₹${(Number(hall.price.replace(/[^\d]/g, '')) + (Number(hall.price.replace(/[^\d]/g, '')) * (typeof hall.platformFeePercent === 'number' ? hall.platformFeePercent : 10) / 100)).toLocaleString('en-IN')}`
                                  : 'Price on Request')}
                            </span>
                            {/* Example discount/strike-through price */}
                            {hall.originalPrice && hall.originalPrice > hall.price && (
                              <span className={mapView ? "text-gray-400 line-through text-xs" : "text-gray-400 line-through text-xs sm:text-sm"}>₹{hall.originalPrice.toLocaleString('en-IN')}</span>
                            )}
                            {/* Example discount percent */}
                            {hall.originalPrice && hall.originalPrice > hall.price && (
                              <span className={mapView ? "text-green-600 text-xs font-semibold" : "text-green-600 text-xs sm:text-sm font-semibold"}>{Math.round(100 - (hall.price / hall.originalPrice) * 100)}% off</span>
                            )}
                            {/* Taxes/fees info */}
                            <span className={mapView ? "text-[10px] text-gray-500" : "text-[10px] sm:text-xs text-gray-500"}>+ taxes & fees</span>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
                            <button className={mapView ? "btn-primary rounded-lg px-2 py-1 text-xs font-semibold shadow-sm w-full sm:w-auto" : "btn-primary rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold shadow-sm w-full sm:w-auto"}
                              onClick={() => router.push(`/halls/${hall._id}`)}
                            >
                              View Details
                            </button>
                            <button className={mapView ? "rounded-lg px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-all w-full sm:w-auto" : "rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-all w-full sm:w-auto"}
                              onClick={() => {
                                const date = filters.dateRangeStart || '';
                                const guests = filters.capacity || '';
                                router.push(`/halls/${hall._id}/book${date || guests ? `?${date ? `date=${encodeURIComponent(date)}` : ''}${date && guests ? '&' : ''}${guests ? `guests=${encodeURIComponent(guests)}` : ''}` : ''}`); 
                              }}
                            >Book Now</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {idx !== venues.length - 1 && (
                      <hr className="border-t border-gray-200 m-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          {/* Pagination controls at the end of the list */}
          <div className="flex justify-center items-center gap-2 mt-6 mb-2">
            <button
              className="px-3 py-1 rounded-md border-2 border-primary-600 bg-white hover:bg-primary-50 shadow text-primary-700 font-bold transition-all duration-200 disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-primary-700 font-semibold text-base">Page {page} of {totalPages}</span>
            <button
              className="px-3 py-1 rounded-md border-2 border-primary-600 bg-white hover:bg-primary-50 shadow text-primary-700 font-bold transition-all duration-200 disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </main>
        {/* Map Section (only if mapView is enabled) */}
        {mapView && (
          <div className="w-1/2 max-w-[50vw] h-[80vh] rounded-2xl overflow-hidden relative mt-6 flex-shrink-0" style={{ minWidth: 0 }}>
            <div className="absolute top-4 left-4 z-10 bg-white rounded shadow px-4 py-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={searchAsMove}
                onChange={e => setSearchAsMove(e.target.checked)}
                id="search-as-move"
              />
              <label htmlFor="search-as-move" className="text-gray-700 font-medium select-none">Search as I move map</label>
            </div>
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={venues.length > 0 && venues[0].geo && venues[0].geo.coordinates ? { lat: venues[0].geo.coordinates[1], lng: venues[0].geo.coordinates[0] } : defaultCenter}
                zoom={venues.length > 0 ? 12 : 5}
                onIdle={handleMapIdle}
                onLoad={map => { mapRef.current = map; }}
              >
                {/* Markers are handled imperatively for clustering */}
              </GoogleMap>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
