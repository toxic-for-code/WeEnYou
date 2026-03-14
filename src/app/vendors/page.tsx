'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

const CATEGORIES = [
  'All',
  'Food & Catering',
  'Photography & Videography',
  'Beauty & Grooming',
  'Wedding Planning',
  'Apparel & Accessories',
  'Decorators',
  'Invitation Designers'
];

export default function VendorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header section with Search */}
      <section className="bg-white border-b border-gray-200 py-8 px-4 sm:px-6 lg:py-12 lg:px-10 text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">Discover Top Vendors</h1>
        <p className="text-gray-500 text-sm sm:text-base lg:text-lg mb-6 lg:mb-8 max-w-2xl mx-auto">
          Find the best catering, decorators, photographers, and more for your perfect event.
        </p>
        
        <div className="max-w-4xl mx-auto bg-white rounded-2xl lg:rounded-full shadow-md border border-gray-100 p-3 lg:p-2 flex flex-col lg:flex-row gap-3 lg:gap-2 items-center">
          <div className="flex-1 flex items-center w-full bg-gray-50 rounded-xl lg:rounded-full px-4 py-3 lg:py-3">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search vendors..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-gray-800"
            />
          </div>
          <div className="flex-1 flex items-center w-full bg-gray-50 rounded-xl lg:rounded-full px-4 py-3 lg:py-3 lg:border-l border-gray-200">
            <MapPinIcon className="w-5 h-5 text-[#C89B3C] mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Location" 
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-gray-800"
            />
          </div>
          <button className="bg-[#C89B3C] text-white px-8 py-3 rounded-xl lg:rounded-full font-bold w-full lg:w-auto hover:bg-[#b58931] transition-colors">
            Search
          </button>
        </div>
      </section>

      {/* Main Content (Categories + Grid) */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 py-8 lg:py-10 mb-10 overflow-hidden">
        
        {/* Categories Bar */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-6 scrollbar-hide w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-5 py-2 rounded-full font-medium transition-colors text-sm border ${
                activeCategory === category 
                ? 'bg-[#C89B3C] text-white border-[#C89B3C]' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#C89B3C] hover:text-[#C89B3C]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Vendors Grid Container */}
        <div className="w-full">
          {/* Empty State / Grid Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12 text-center mt-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Vendors Coming Soon</h2>
            <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
              We are onboarding vendors in your city. Check back soon for the best 
              {" "}<span className="font-medium text-gray-700">{activeCategory.toLowerCase() !== 'all' ? activeCategory.toLowerCase() : 'event professionals'}</span>{" "}
              in your area.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
