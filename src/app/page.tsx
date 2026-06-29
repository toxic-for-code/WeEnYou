'use client';
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MapPinIcon, CalendarIcon, UsersIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import VenueCard from '@/components/VenueCard';
import EarlyUserFeedback from '@/components/EarlyUserFeedback';

// Removed eventTypes, now using date range
const capacities = ['50+ guests', '100+ guests', '200+ guests', '500+ guests', '1000+ guests'];

export default function Home() {
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState('Any cap');
  const [featuredHalls, setFeaturedHalls] = useState<any[]>([]);
  const [loadingHalls, setLoadingHalls] = useState(true);
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [priceRange, setPriceRange] = useState('');
  const router = useRouter();
  const { data: session } = useSession();
  const [nearMeLoading, setNearMeLoading] = useState(false);

  // Carousel auto-scroll state
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Autocomplete for city input
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const cityInputRef = useRef<HTMLInputElement>(null);

  async function handleCityInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setCity(value);
    if (value.length > 1) {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(`/api/addresses-autocomplete?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setCitySuggestions(data.suggestions || []);
        setShowSuggestions((data.suggestions || []).length > 0);
      } catch {
        setCitySuggestions([]);
        setShowSuggestions(false);
      }
      setLoadingSuggestions(false);
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  }

  function handleCitySuggestionClick(suggestion: string) {
    setCity(suggestion);
    setShowSuggestions(false);
    cityInputRef.current?.blur();
  }

  function handleCityInputBlur() {
    setTimeout(() => setShowSuggestions(false), 100); // Delay to allow click
  }

  function handleCityInputFocus() {
    if (citySuggestions.length > 0) setShowSuggestions(true);
  }

  useEffect(() => {
    const fetchFeaturedHalls = async () => {
      try {
        setLoadingHalls(true);
        const res = await fetch('/api/halls/featured');
        
        if (!res.ok) {
          setFeaturedHalls([]);
          return;
        }
        
        const data = await res.json();
        setFeaturedHalls(data.halls || []);
      } catch (error) {
        console.error('Failed to fetch featured halls:', error);
        setFeaturedHalls([]);
      } finally {
        setLoadingHalls(false);
      }
    };
    
    fetchFeaturedHalls();
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    if (!carouselRef.current || featuredHalls.length === 0 || isPaused) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      return;
    }

    const scrollContainer = carouselRef.current;
    const scrollStep = 380; // Card width + gap

    autoScrollIntervalRef.current = setInterval(() => {
      if (!scrollContainer) return;
      
      const currentScroll = scrollContainer.scrollLeft;
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      
      if (currentScroll >= maxScroll - 10) {
        // Reset to start for infinite scroll effect
        scrollContainer.scrollTo({ left: 0, behavior: 'auto' });
      } else {
        scrollContainer.scrollBy({ left: scrollStep, behavior: 'smooth' });
      }
    }, 3000); // Scroll every 3 seconds

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [featuredHalls.length, isPaused]);

  // Navigation functions
  const scrollLeft = () => {
    if (carouselRef.current) {
      const scrollStep = 380;
      carouselRef.current.scrollBy({ left: -scrollStep, behavior: 'smooth' });
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000); // Resume after 5 seconds
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const scrollStep = 380;
      carouselRef.current.scrollBy({ left: scrollStep, behavior: 'smooth' });
      setIsPaused(true);
      setTimeout(() => setIsPaused(false), 5000); // Resume after 5 seconds
    }
  };



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    // Past date validation
    if (startDate) {
      const selected = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        alert("Please select a current or future date.");
        return;
      }
    }

    const params = new URLSearchParams({
      city,
      startDate,
      endDate,
      minCapacity: capacity === 'Any cap' ? '' : capacity.replace('+ guests', ''),
    });
    router.push(`/halls?${params.toString()}`);
  };

  const handleListYourHall = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      router.push('/auth/signin');
    } else {
      router.push('/list-your-hall');
    }
  };

  async function getLocation() {
    setNearMeLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const cityName =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.hamlet ||
              data.address.state_district ||
              data.address.state ||
              '';
            setCity(cityName);
          } catch (err) {
            alert('Could not determine your city.');
          }
          setNearMeLoading(false);
        },
        (error) => {
          alert('Unable to retrieve your location.');
          setNearMeLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setNearMeLoading(false);
    }
  }

  return (
    <div className="page-mobile-first min-h-screen bg-[#f6f5f2] font-sans">
      {/* Hero Section with Background */}
      <section className="relative w-full min-h-[500px] lg:h-[580px] flex flex-col justify-center items-center text-center overflow-hidden rounded-b-[2.5rem] shadow-xl mb-10 md:mb-16">
        {/* Background Image */}
        <Image
          src="/bg.png"
          alt="Browse Venues"
          fill
          className="object-cover object-center absolute inset-0 w-full h-full z-0"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/30 z-10" />
        {/* Content */}
        <div className="relative z-20 w-full flex flex-col items-center justify-center min-h-[500px] px-5 sm:px-8 py-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg mb-4 lg:mb-6 animate-fade-in leading-tight max-w-4xl font-['Plus_Jakarta_Sans',sans-serif]">
            Find Your Perfect Venue <br className="hidden md:block" />
            For Every Celebration
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-100 mb-8 max-w-2xl mx-auto animate-fade-in delay-100 leading-relaxed font-medium">
            Discover, compare, and book top-rated banquet halls and event spaces.
          </p>
          
          {/* Mobile-first Search Form */}
          <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-5 flex flex-col lg:flex-row gap-4 items-center w-full max-w-5xl mx-auto animate-fade-in delay-200">
                <div className="relative w-full lg:flex-1">
                  <input
                    ref={cityInputRef}
                    type="text"
                    className="w-full pl-11 pr-12 py-3.5 md:py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] text-gray-800 text-base font-medium transition-all shadow-inner"
                    value={city}
                    onChange={handleCityInput}
                    onBlur={handleCityInputBlur}
                    onFocus={handleCityInputFocus}
                    placeholder="Location: city, venue, capacity"
                    required
                    aria-label="Location"
                    aria-autocomplete="list"
                    aria-controls="city-suggestions"
                    aria-expanded={showSuggestions}
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C89B3C]">
                    <MapPinIcon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  {/* Autocomplete dropdown */}
                  {showSuggestions && (
                    <ul id="city-suggestions" role="listbox" className="absolute left-0 right-0 top-full z-20 bg-white border border-gray-200 rounded-b-lg shadow-lg max-h-48 overflow-auto mt-1">
                      {loadingSuggestions && <li className="px-4 py-2 text-gray-500">Loading...</li>}
                      {citySuggestions.map((suggestion) => (
                        <li
                          key={suggestion}
                          role="option"
                          aria-selected={city === suggestion}
                          className="px-4 py-2 cursor-pointer hover:bg-blue-50 text-gray-800"
                          onMouseDown={() => handleCitySuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-[#C89B3C] hover:bg-gold/10 transition-colors"
                  onClick={getLocation}
                  aria-label="Use current location for city"
                  disabled={nearMeLoading}
                >
                 {nearMeLoading ? (
                   <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                   </svg>
                 ) : (
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                   </svg>
                 )}
               </button>
            </div>
            
            {/* Dates & Capacity Stack */}
            <div className="w-full lg:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative w-full h-[54px] md:h-[60px]">
                <div className="absolute inset-0 flex items-center pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 text-base font-medium shadow-inner">
                  <span className="absolute left-3.5 text-[#C89B3C]">
                    <CalendarIcon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className={startDate ? "text-gray-800 font-bold" : "text-gray-400 font-medium"}>
                    {startDate ? new Date(startDate).toLocaleDateString() : "Select event date"}
                  </span>
                </div>
                <input
                  type="date"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setStartDate(e.target.value)}
                  onClick={(e) => (e.target as any).showPicker && (e.target as any).showPicker()}
                  required
                  aria-label="Event date"
                />
              </div>

              <div className="relative w-full">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C89B3C]">
                  <UsersIcon className="w-5 h-5" aria-hidden="true" />
                </span>
                <select
                  className="w-full pl-11 pr-10 py-3.5 md:py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] text-gray-800 text-base font-medium shadow-inner appearance-none"
                  value={capacity}
                  onChange={e => setCapacity(e.target.value)}
                  aria-label="Capacity"
                >
                  <option value="Any cap">Any cap</option>
                  {capacities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full lg:w-auto mt-2 lg:mt-0 bg-[#C89B3C] hover:bg-[#b58931] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
              aria-label="Search venues"
            >
              <span>Search Venues</span>
            </button>
          </form>
        </div>
      </section>



      {/* Featured Halls */}
      <section className="py-[60px] bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Featured Halls</h2>
            <a href="/venues" className="hidden sm:inline-flex text-[#C89B3C] font-semibold hover:text-[#b58931] transition-colors gap-1 items-center">
              View All <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </div>

          {loadingHalls ? (
            <div className="flex overflow-x-auto gap-[20px] pb-6 scrollbar-hide">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-80 w-[85vw] sm:w-[320px] md:w-[280px] shrink-0"></div>
              ))}
            </div>
          ) : featuredHalls.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No featured halls found.</div>
          ) : (
            <div className="flex overflow-x-auto gap-[20px] pb-6 snap-x snap-mandatory scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0">
              {featuredHalls.map((hall, i) => (
                <VenueCard key={hall._id || i} hall={hall} priority={i < 2} />
              ))}
            </div>
          )}
          <div className="mt-6 text-center sm:hidden">
            <a href="/venues" className="inline-flex text-[#C89B3C] font-semibold hover:text-[#b58931] transition-colors gap-1 items-center bg-gold/10 px-6 py-3 rounded-xl w-full justify-center">
              View All <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-[#fafafa] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Planning your perfect event is easier than ever with WeEnYou.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 md:hover:-translate-y-2 border border-gray-50 flex flex-row md:flex-col items-center md:text-center group gap-5 md:gap-0">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#fef9f0] rounded-xl sm:rounded-2xl flex items-center justify-center md:mb-6 group-hover:bg-[#C89B3C] transition-colors duration-300">
                <MagnifyingGlassIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#C89B3C] group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-3">Search & Discover</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                  Explore verified venues across India tailored to your specific needs.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 md:hover:-translate-y-2 border border-gray-50 flex flex-row md:flex-col items-center md:text-center group gap-5 md:gap-0">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#fef9f0] rounded-xl sm:rounded-2xl flex items-center justify-center md:mb-6 group-hover:bg-[#C89B3C] transition-colors duration-300">
                <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-[#C89B3C] group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-3">Request & Confirm</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                  Check availability and get confirmation instantly with secure booking.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 sm:p-8 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 md:hover:-translate-y-2 border border-gray-50 flex flex-row md:flex-col items-center md:text-center group gap-5 md:gap-0 sm:col-span-2 md:col-span-1 mx-auto sm:w-full md:w-auto">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#fef9f0] rounded-xl sm:rounded-2xl flex items-center justify-center md:mb-6 group-hover:bg-[#C89B3C] transition-colors duration-300">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center">
                  <svg className="w-full h-full text-[#C89B3C] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-3">Celebrate & Enjoy</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                  Host your event with peace of mind with our professional support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Early User Feedback Section */}
      <EarlyUserFeedback />

      {/* Why Choose WeEnYou */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-12 sm:mb-16 px-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 animate-fade-in-up">
              Why Choose WeEnYou
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto animate-fade-in-up delay-100">
              Reliable venue booking service across India.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-10">
            {/* Feature 1 */}
            <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group animate-fade-in-up flex flex-row lg:flex-col items-center lg:text-center gap-5 lg:gap-0">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#C89B3C] to-[#b58931] flex items-center justify-center lg:mb-8 shadow-lg shadow-gold/20 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <MapPinIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Location Based</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Find venues near your location or explore premium options across India.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group animate-fade-in-up delay-150 flex flex-row lg:flex-col items-center lg:text-center gap-5 lg:gap-0">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#C89B3C] to-[#b58931] flex items-center justify-center lg:mb-8 shadow-lg shadow-gold/20 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Easy Booking</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Streamlined booking process with instant confirmation and transparent pricing.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 group animate-fade-in-up delay-300 sm:col-span-2 lg:col-span-1 mx-auto sm:w-full lg:w-auto flex flex-row lg:flex-col items-center lg:text-center gap-5 lg:gap-0">
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#C89B3C] to-[#b58931] flex items-center justify-center lg:mb-8 shadow-lg shadow-gold/20 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Verified Venues</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Every venue undergoes a rigorous quality and safety verification process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.23, 1, 0.32, 1) both;
        }
        .animate-fade-in-up.delay-100 {
          animation-delay: 0.15s;
        }
        .animate-fade-in-up.delay-200 {
          animation-delay: 0.3s;
        }
        .animate-fade-in-up.delay-150 {
          animation-delay: 0.2s;
        }
        .animate-fade-in-up.delay-300 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  )
}
 