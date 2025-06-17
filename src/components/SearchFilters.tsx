'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchFiltersProps {
  filters: {
    location: string;
    date: string;
    capacity: string;
    priceRange: string;
    amenities: string[];
  };
  setFilters: (filters: any) => void;
}

const amenitiesList = [
  { id: 'Parking', label: 'Parking' },
  { id: 'Catering', label: 'Catering' },
  { id: 'Decoration', label: 'Decoration' },
  { id: 'Music System', label: 'Music System' },
  { id: 'Air Conditioning', label: 'Air Conditioning' },
  { id: 'WiFi', label: 'WiFi' },
];

const priceRanges = [
  { id: '0-10000', label: 'Under ₹10,000' },
  { id: '10000-25000', label: '₹10,000 - ₹25,000' },
  { id: '25000-50000', label: '₹25,000 - ₹50,000' },
  { id: '50000+', label: 'Above ₹50,000' },
];

export default function SearchFilters({ filters, setFilters }: SearchFiltersProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL with new filters
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join(','));
        } else if (!Array.isArray(value) && value !== '') {
          params.set(key, value.toString());
        }
      }
    });
    router.push(`/halls?${params.toString()}`);
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 rounded-lg"
        >
          <span className="font-medium">Filters</span>
          <svg
            className={`w-5 h-5 transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            placeholder="Enter city or area"
            className="input-field"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="input-field"
          />
        </div>

        {/* Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacity
          </label>
          <select
            value={filters.capacity}
            onChange={(e) => handleFilterChange('capacity', e.target.value)}
            className="input-field"
          >
            <option value="">Any</option>
            <option value="50">50+ people</option>
            <option value="100">100+ people</option>
            <option value="200">200+ people</option>
            <option value="500">500+ people</option>
            <option value="1000">1000+ people</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <label key={range.id} className="flex items-center">
                <input
                  type="radio"
                  name="priceRange"
                  value={range.id}
                  checked={filters.priceRange === range.id}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="h-4 w-4 text-primary-600"
                />
                <span className="ml-2 text-sm text-gray-700">{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amenities
          </label>
          <div className="space-y-2">
            {amenitiesList.map((amenity) => (
              <label key={amenity.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity.id)}
                  onChange={() => handleAmenityToggle(amenity.id)}
                  className="h-4 w-4 text-primary-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 