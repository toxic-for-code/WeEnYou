'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchFiltersProps {
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
  setFilters: (filters: any) => void;
}

const amenitiesList = [
  { id: 'Parking', label: 'Parking' },
  { id: 'Catering', label: 'Catering' },
  { id: 'Decoration', label: 'Decoration' },
  { id: 'Music System', label: 'Music System' },
  { id: 'Air Conditioning', label: 'Air Conditioning' },
  { id: 'Wi-Fi', label: 'Wi-Fi' },
];

const priceRanges = [
  { id: '0-10000', label: 'Under ₹10,000' },
  { id: '10000-25000', label: '₹10,000 - ₹25,000' },
  { id: '25000-50000', label: '₹25,000 - ₹50,000' },
  { id: '50000+', label: 'Above ₹50,000' },
];

const FILTER_SECTIONS = [
  { id: 'location', label: 'Location' },
  { id: 'dateRange', label: 'Date Range' },
  { id: 'capacity', label: 'Capacity' },
  { id: 'priceRange', label: 'Price Range' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'minRating', label: 'Minimum Rating' },
  { id: 'nearMe', label: 'Search Near Me' },
];

const isFilterActive = (filters: any, useMyLocation: boolean) => ({
  location: !!filters.location,
  dateRange: !!filters.dateRangeStart || !!filters.dateRangeEnd,
  capacity: !!filters.capacity,
  priceRange: !!filters.priceRange,
  amenities: filters.amenities && filters.amenities.length > 0,
  minRating: !!filters.minRating,
  nearMe: useMyLocation,
});

export default function SearchFilters({ filters, setFilters }: SearchFiltersProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  // Initialize openSections based on FILTER_SECTIONS
  useEffect(() => {
    FILTER_SECTIONS.forEach(section => setOpenSections(prev => ({ ...prev, [section.id]: false })));
  }, []);

  // Get user geolocation if 'Near Me' is toggled
  useEffect(() => {
    if (useMyLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null),
        { timeout: 3000 }
      );
    }
  }, [useMyLocation]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL with new filters
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) {
        if (Array.isArray(v) && v.length > 0) {
          params.set(k, v.join(','));
        } else if (!Array.isArray(v) && v !== '') {
          // Special handling for capacity
          if (k === 'capacity') {
            params.set('minCapacity', v.toString());
          } else {
            params.set(k, v.toString());
          }
        }
      }
    });
    // Add dateRange param if both start and end are set
    if (newFilters.dateRangeStart && newFilters.dateRangeEnd) {
      params.set('dateRange', `${newFilters.dateRangeStart},${newFilters.dateRangeEnd}`);
    }
    // Add user location if available
    if (userLocation) {
      params.set('userLat', userLocation.lat.toString());
      params.set('userLng', userLocation.lng.toString());
    }
    // Use 'q' param for backend hybrid search (city or venue name)
    if (newFilters.location) {
      params.set('q', newFilters.location);
    }
    const url = `/browse?${params.toString()}`;
    console.log('Filter change: filters =', newFilters, 'URL =', url);
    router.push(url);
  };

  const handleAmenityToggle = (amenityId: string) => {
    const currentAmenities = [...filters.amenities];
    const index = currentAmenities.indexOf(amenityId);

    if (index === -1) {
      currentAmenities.push(amenityId);
    } else {
      currentAmenities.splice(index, 1);
    }

    handleFilterChange('amenities', currentAmenities);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.location && !useMyLocation) params.set('location', filters.location);
    if (useMyLocation && userLocation) {
      params.set('useMyLocation', 'true');
      params.set('lat', userLocation.lat.toString());
      params.set('lng', userLocation.lng.toString());
    }
    if (filters.dateRangeStart) params.set('dateRangeStart', filters.dateRangeStart);
    if (filters.dateRangeEnd) params.set('dateRangeEnd', filters.dateRangeEnd);
    if (filters.capacity) params.set('capacity', filters.capacity);
    router.push(`/browse?${params.toString()}`);
  };

  const handleClearAll = () => {
    // Preserve location/city filter, reset all others
    const clearedFilters = {
      location: filters.location || '',
      date: '',
      capacity: '',
      priceRange: '',
      amenities: [],
      minRating: '',
      dateRangeStart: '',
      dateRangeEnd: '',
    };
    setFilters(clearedFilters);
    // Build URL, keep location/city param
    const params = new URLSearchParams();
    if (filters.location) {
      // Use 'city' param if that's what the rest of the app expects, otherwise use 'q'
      params.set('city', filters.location);
      params.set('q', filters.location); // for hybrid search compatibility
    }
    params.set('page', '1');
    params.set('limit', '100');
    params.set('sort', 'popularity');
    const url = `/browse?${params.toString()}`;
    router.push(url);
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const active = isFilterActive(filters, useMyLocation);

  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleFilterChange('location', value);

    if (value.length > 1) {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/addresses-autocomplete?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch {
        setSuggestions([]);
      }
      setLoadingSuggestions(false);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-800">Filters</h2>
        <button
          onClick={handleClearAll}
          className="text-xs sm:text-sm text-primary-600 hover:underline ml-auto"
        >
          Clear All
        </button>
      </div>

      <div className={`space-y-4 sm:space-y-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Location (collapsible) */}
        <div role="region" aria-labelledby="filter-location-label">
          <button
            type="button"
            className="w-full flex justify-between items-center py-2 text-sm sm:text-base"
            onClick={() => toggleSection('location')}
            aria-expanded={openSections.location}
            aria-controls="filter-location-panel"
            aria-label="Toggle Location filter section"
            id="filter-location-label"
          >
            <span className={`font-medium flex items-center ${active.location ? 'text-primary-600' : ''}`}>Location{active.location && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary-500" />}</span>
            <svg className={`w-4 h-4 ml-2 transition-transform ${openSections.location ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {openSections.location && (
            <div className="relative">
            <input
              type="text"
              value={filters.location}
                onChange={handleLocationChange}
              placeholder="Enter city or area"
              className="input-field mt-2"
              id="filter-location-input"
              aria-label="Location"
                autoComplete="off"
            />
              {(suggestions.length > 0 || loadingSuggestions) && (
                <ul ref={suggestionsRef} className="absolute z-10 bg-white border border-gray-200 rounded shadow mt-1 w-full max-h-48 overflow-y-auto">
                  {loadingSuggestions && <li className="p-2 text-gray-500">Loading...</li>}
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="p-2 hover:bg-primary-100 cursor-pointer"
                      onClick={() => {
                        handleFilterChange('location', s);
                        setSuggestions([]);
                      }}
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {/* Date Range (collapsible) */}
        <div role="region" aria-labelledby="filter-date-range-label">
          <button
            type="button"
            className="w-full flex justify-between items-center py-2"
            onClick={() => toggleSection('dateRange')}
            aria-expanded={openSections.dateRange}
            aria-controls="filter-date-range-panel"
            aria-label="Toggle Date Range filter section"
            id="filter-date-range-label"
          >
            <span className={`font-medium flex items-center ${active.dateRange ? 'text-primary-600' : ''}`}>Date Range{active.dateRange && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary-500" />}</span>
            <svg className={`w-4 h-4 ml-2 transition-transform ${openSections.dateRange ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {openSections.dateRange && (
            <div className="flex flex-col gap-2 mt-2 w-full" id="filter-date-range-panel">
              <label htmlFor="filter-date-range-start" className="sr-only">Start Date</label>
              <input
                type="date"
                value={filters.dateRangeStart || ''}
                onChange={e => handleFilterChange('dateRangeStart', e.target.value)}
                className="input-field w-full"
                id="filter-date-range-start"
                aria-label="Start Date"
              />
              <span className="self-center">to</span>
              <label htmlFor="filter-date-range-end" className="sr-only">End Date</label>
              <input
                type="date"
                value={filters.dateRangeEnd || ''}
                onChange={e => handleFilterChange('dateRangeEnd', e.target.value)}
                className="input-field w-full"
                id="filter-date-range-end"
                aria-label="End Date"
              />
            </div>
          )}
        </div>
        {/* Capacity (collapsible) */}
        <div role="region" aria-labelledby="filter-capacity-label">
          <button
            type="button"
            className="w-full flex justify-between items-center py-2"
            onClick={() => toggleSection('capacity')}
            aria-expanded={openSections.capacity}
            aria-controls="filter-capacity-panel"
            aria-label="Toggle Capacity filter section"
            id="filter-capacity-label"
          >
            <span className={`font-medium flex items-center ${active.capacity ? 'text-primary-600' : ''}`}>Capacity{active.capacity && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary-500" />}</span>
            <svg className={`w-4 h-4 ml-2 transition-transform ${openSections.capacity ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {openSections.capacity && (
            <select
              value={filters.capacity}
              onChange={(e) => handleFilterChange('capacity', e.target.value)}
              className="input-field mt-2"
              id="filter-capacity-select"
              aria-label="Capacity"
            >
              <option value="">Any</option>
              <option value="50">50+ people</option>
              <option value="100">100+ people</option>
              <option value="200">200+ people</option>
              <option value="500">500+ people</option>
              <option value="1000">1000+ people</option>
            </select>
          )}
        </div>
        {/* Price Range (collapsible) */}
        <div role="region" aria-labelledby="filter-price-range-label">
          <button
            type="button"
            className="w-full flex justify-between items-center py-2"
            onClick={() => toggleSection('priceRange')}
            aria-expanded={openSections.priceRange}
            aria-controls="filter-price-range-panel"
            aria-label="Toggle Price Range filter section"
            id="filter-price-range-label"
          >
            <span className={`font-medium flex items-center ${active.priceRange ? 'text-primary-600' : ''}`}>Price Range{active.priceRange && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary-500" />}</span>
            <svg className={`w-4 h-4 ml-2 transition-transform ${openSections.priceRange ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {openSections.priceRange && (
            <div className="space-y-2 mt-2" id="filter-price-range-panel">
              {priceRanges.map((range) => (
                <label key={range.id} className="flex items-center">
                  <input
                    type="radio"
                    name="priceRange"
                    value={range.id}
                    checked={filters.priceRange === range.id}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="h-4 w-4 text-primary-600"
                    aria-label={range.label}
                  />
                  <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Amenities (collapsible) */}
        <div role="region" aria-labelledby="filter-amenities-label">
          <button
            type="button"
            className="w-full flex justify-between items-center py-2"
            onClick={() => toggleSection('amenities')}
            aria-expanded={openSections.amenities}
            aria-controls="filter-amenities-panel"
            aria-label="Toggle Amenities filter section"
            id="filter-amenities-label"
          >
            <span className={`font-medium flex items-center ${active.amenities ? 'text-primary-600' : ''}`}>Amenities{active.amenities && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary-500" />}</span>
            <svg className={`w-4 h-4 ml-2 transition-transform ${openSections.amenities ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {openSections.amenities && (
            <div className="space-y-2 mt-2" id="filter-amenities-panel">
              {amenitiesList.map((amenity) => (
                <label key={amenity.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
                    className="h-4 w-4 text-primary-600 rounded"
                    aria-label={amenity.label}
                  />
                  <span className="ml-2 text-sm text-gray-700">{amenity.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Minimum Rating (collapsible) */}
        <div role="region" aria-labelledby="filter-min-rating-label">
          <button
            type="button"
            className="w-full flex justify-between items-center py-2"
            onClick={() => toggleSection('minRating')}
            aria-expanded={openSections.minRating}
            aria-controls="filter-min-rating-panel"
            aria-label="Toggle Minimum Rating filter section"
            id="filter-min-rating-label"
          >
            <span className={`font-medium flex items-center ${active.minRating ? 'text-primary-600' : ''}`}>Minimum Rating{active.minRating && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary-500" />}</span>
            <svg className={`w-4 h-4 ml-2 transition-transform ${openSections.minRating ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {openSections.minRating && (
            <select
              value={filters.minRating || ''}
              onChange={e => handleFilterChange('minRating', e.target.value)}
              className="input-field mt-2"
              id="filter-min-rating-select"
              aria-label="Minimum Rating"
            >
              <option value="">Any</option>
              {[5,4,3,2,1].map(r => (
                <option key={r} value={r}>{r}+</option>
              ))}
            </select>
          )}
        </div>
        {/* Near Me Toggle (collapsible) */}
        <div role="region" aria-labelledby="filter-near-me-label">
          <button
            type="button"
            className="w-full flex justify-between items-center py-2"
            onClick={() => toggleSection('nearMe')}
            aria-expanded={openSections.nearMe}
            aria-controls="filter-near-me-panel"
            aria-label="Toggle Search Near Me filter section"
            id="filter-near-me-label"
          >
            <span className={`font-medium flex items-center ${active.nearMe ? 'text-primary-600' : ''}`}>Search Near Me{active.nearMe && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary-500" />}</span>
            <svg className={`w-4 h-4 ml-2 transition-transform ${openSections.nearMe ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          {openSections.nearMe && (
            <div className="flex items-center space-x-2 mt-2" id="filter-near-me-panel">
              <input
                type="checkbox"
                id="useMyLocation"
                checked={useMyLocation}
                onChange={(e) => setUseMyLocation(e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded"
                aria-label="Use my current location for search"
              />
              <label htmlFor="useMyLocation" className="text-sm text-gray-700">
                Use my current location for search
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
 