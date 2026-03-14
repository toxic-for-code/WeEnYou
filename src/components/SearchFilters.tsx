'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronDownIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UsersIcon, 
  BanknotesIcon, 
  CheckBadgeIcon, 
  AdjustmentsVerticalIcon,
  XMarkIcon,
  StarIcon as StarIconOutline
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

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
  { id: 'location', label: 'Location', icon: MapPinIcon },
  { id: 'dateRange', label: 'Date Range', icon: CalendarIcon },
  { id: 'capacity', label: 'Capacity', icon: UsersIcon },
  { id: 'priceRange', label: 'Price Range', icon: BanknotesIcon },
  { id: 'amenities', label: 'Amenities', icon: CheckBadgeIcon },
  { id: 'minRating', label: 'Minimum Rating', icon: StarIconOutline },
];

export default function SearchFilters({ filters, setFilters }: SearchFiltersProps) {
  const router = useRouter();
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    location: true,
    capacity: true,
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) {
        if (Array.isArray(v) && v.length > 0) {
          params.set(k, v.join(','));
        } else if (!Array.isArray(v) && v !== '') {
          if (k === 'capacity') {
            params.set('minCapacity', v.toString());
          } else {
            params.set(k, v.toString());
          }
        }
      }
    });


    if (newFilters.location) {
      params.set('q', newFilters.location);
    }
    const url = `/browse?${params.toString()}`;
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

  const handleClearAll = () => {
    const clearedFilters = {
      location: '',
      date: '',
      capacity: '',
      priceRange: '',
      amenities: [],
      minRating: '',
      dateRangeStart: '',
      dateRangeEnd: '',
    };
    setFilters(clearedFilters);
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', '100');
    params.set('sort', 'popularity');
    router.push(`/browse?${params.toString()}`);
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isSectionActive = (id: string) => {
    switch (id) {
      case 'location': return !!filters.location;
      case 'dateRange': return !!filters.dateRangeStart || !!filters.dateRangeEnd;
      case 'capacity': return !!filters.capacity;
      case 'priceRange': return !!filters.priceRange;
      case 'amenities': return filters.amenities.length > 0;
      case 'minRating': return !!filters.minRating;
      default: return false;
    }
  };

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
    <div className="flex flex-col gap-4">
      {/* Search Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AdjustmentsVerticalIcon className="w-5 h-5 text-gray-900" />
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Filters</h2>
        </div>
        <button
          onClick={handleClearAll}
          className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1 rounded-full transition-colors"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-3">
        {FILTER_SECTIONS.map((section) => (
          <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isSectionActive(section.id) ? 'bg-primary-100 text-primary-600' : 'bg-gray-50 text-gray-500'}`}>
                  <section.icon className="w-4 h-4" />
                </div>
                <span className={`text-sm font-bold ${isSectionActive(section.id) ? 'text-gray-900' : 'text-gray-600'}`}>
                  {section.label}
                </span>
                {isSectionActive(section.id) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
                )}
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openSections[section.id] ? 'rotate-180' : ''}`} />
            </button>

            {openSections[section.id] && (
              <div className="px-3 pb-3 border-t border-gray-50 pt-3 animate-fade-in">
                {section.id === 'location' && (
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.location}
                      onChange={handleLocationChange}
                      placeholder="Search city, area..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                    {(suggestions.length > 0 || loadingSuggestions) && (
                      <ul ref={suggestionsRef} className="absolute z-20 bg-white border border-gray-100 rounded-xl shadow-xl mt-2 w-full max-h-48 overflow-y-auto">
                        {loadingSuggestions && <li className="p-3 text-xs text-gray-500 animate-pulse">Searching...</li>}
                        {suggestions.map((s, i) => (
                          <li
                            key={i}
                            className="p-3 text-sm hover:bg-primary-50 cursor-pointer text-gray-700 font-medium transition-colors"
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

                {section.id === 'dateRange' && (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 px-1">Start Date</label>
                      <input
                        type="date"
                        value={filters.dateRangeStart || ''}
                        onChange={e => handleFilterChange('dateRangeStart', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase text-gray-400 px-1">End Date</label>
                      <input
                        type="date"
                        value={filters.dateRangeEnd || ''}
                        onChange={e => handleFilterChange('dateRangeEnd', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                )}

                {section.id === 'capacity' && (
                  <div className="grid grid-cols-2 gap-2">
                    {['50', '100', '200', '500', '1000'].map((cap) => (
                      <button
                        key={cap}
                        onClick={() => handleFilterChange('capacity', filters.capacity === cap ? '' : cap)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${filters.capacity === cap ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100' : 'bg-gray-50 text-gray-600 border-transparent hover:border-gray-200'}`}
                      >
                        {cap}+ Guests
                      </button>
                    ))}
                  </div>
                )}

                {section.id === 'priceRange' && (
                  <div className="flex flex-col gap-2">
                    {priceRanges.map((range) => (
                      <button
                        key={range.id}
                        onClick={() => handleFilterChange('priceRange', filters.priceRange === range.id ? '' : range.id)}
                        className={`flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all border ${filters.priceRange === range.id ? 'bg-primary-50 text-primary-700 border-primary-200 shadow-sm' : 'bg-gray-50 text-gray-600 border-transparent hover:border-gray-200'}`}
                      >
                        <span>{range.label}</span>
                        {filters.priceRange === range.id && <StarIconSolid className="w-4 h-4 text-primary-600" />}
                      </button>
                    ))}
                  </div>
                )}

                {section.id === 'amenities' && (
                  <div className="flex flex-wrap gap-2">
                    {amenitiesList.map((amenity) => (
                      <button
                        key={amenity.id}
                        onClick={() => handleAmenityToggle(amenity.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${filters.amenities.includes(amenity.id) ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-100' : 'bg-gray-50 text-gray-600 border-transparent hover:border-gray-200'}`}
                      >
                        {amenity.label}
                      </button>
                    ))}
                  </div>
                )}

                {section.id === 'minRating' && (
                  <div className="flex items-center justify-around">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => handleFilterChange('minRating', filters.minRating === r.toString() ? '' : r.toString())}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${filters.minRating === r.toString() ? 'bg-yellow-50 text-yellow-700 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        {filters.minRating === r.toString() ? (
                          <StarIconSolid className="w-6 h-6 text-yellow-500" />
                        ) : (
                          <StarIconOutline className="w-6 h-6 text-gray-300" />
                        )}
                        <span className="text-[10px] font-black">{r}+</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
 