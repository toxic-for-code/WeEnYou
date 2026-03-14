'use client';
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MapPinIcon, CalendarIcon, UsersIcon, MagnifyingGlassIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import VenueCard from '@/components/VenueCard';

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

  // Testimonials (static for now)
  const testimonials = [
    {
      name: 'Priya Sharma',
      text: 'Booking my wedding venue was so easy and stress-free. Highly recommend!',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
    {
      name: 'Rahul Verma',
      text: 'Great selection of halls and excellent customer support.',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: 'Ayesha Khan',
      text: "I found the perfect place for my daughter's birthday. Thank you!",
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
  ];
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTestimonialIdx(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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

      {/* Testimonials Section */}
      <section className="py-24 sm:py-32 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 animate-fade-in-up">
              What Our Users Say
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto animate-fade-in-up delay-100">
              Trusted by thousands of happy hosts across India.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto relative group">
            {/* Carousel Navigation Arrows (Optional, but adding for UX) */}
            <button 
              onClick={() => setTestimonialIdx(prev => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -ml-4 sm:-ml-12 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg text-gray-400 hover:text-[#C89B3C] transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
              aria-label="Previous testimonial"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setTestimonialIdx(prev => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -mr-4 sm:-mr-12 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg text-gray-400 hover:text-[#C89B3C] transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
              aria-label="Next testimonial"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>

            {/* Testimonial Card */}
            <div className="bg-white rounded-[3rem] p-8 sm:p-12 md:p-16 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden animate-fade-in-up">
              {/* Decorative Quote Icon */}
              <div className="absolute top-10 left-10 text-gold opacity-10 select-none">
                <svg width="120" height="120" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM14.017 21C14.017 21 14.017 21 14.017 21ZM3 21V18C3 16.8954 3.89543 16 5 16H8C9.10457 16 10 16.8954 10 18V21C10 22.1046 9.10457 23 8 23H5C3.89543 23 3 22.1046 3 21ZM3 21C3 21 3 21 3 21ZM21.017 11.1377C20.352 11.5343 19.7113 11.7513 19.117 11.8369C18.5226 11.9225 17.9715 11.8841 17.4814 11.7109C16.9913 11.5377 16.5919 11.2335 16.2832 10.7984C15.9745 10.3633 15.8201 9.80371 15.8201 9.11963C15.8201 8.3584 15.9868 7.69727 16.3203 7.13623C16.6538 6.5752 17.1196 6.13086 17.7178 5.80322C18.3159 5.47559 19.0112 5.31177 19.8037 5.31177C20.6553 5.31177 21.3647 5.47559 21.9321 5.80322L20.8926 7.39941C20.5957 7.21484 20.2671 7.12256 19.9067 7.12256C19.5312 7.12256 19.2207 7.21777 18.9751 7.4082C18.7295 7.59863 18.5664 7.84863 18.4858 8.1582C18.4053 8.46777 18.3813 8.78467 18.4141 9.10889C18.4468 9.43311 18.5444 9.69189 18.707 9.88525C18.8696 10.0786 19.1411 10.1753 19.5215 10.1753C19.8818 10.1753 20.2178 10.0889 20.5293 9.91602L21.017 11.1377ZM10.017 11.1377C9.35205 11.5343 8.7113 11.7513 8.11699 11.8369C7.52269 11.9225 6.97151 11.8841 6.48145 11.7109C5.99138 11.5377 5.59194 11.2335 5.2832 10.7984C4.97447 10.3633 4.8201 9.80371 4.8201 9.11963C4.8201 8.3584 4.98683 7.69727 5.32031 7.13623C5.6538 6.5752 6.11961 6.13086 6.71777 5.80322C7.31593 5.47559 8.01123 5.31177 8.80371 5.31177C9.65527 5.31177 10.3646 5.47559 10.9321 5.80322L9.89258 7.39941C9.5957 7.21484 9.26711 7.12256 8.90674 7.12256C8.53125 7.12256 8.2207 7.21777 7.9751 7.4082C7.72949 7.59863 7.56641 7.84863 7.48584 8.1582C7.40527 8.46777 7.3813 8.78467 7.41406 9.10889C7.44682 9.43311 7.54443 9.69189 7.70703 9.88525C7.86963 10.0786 8.14111 10.1753 8.52148 10.1753C8.88184 10.1753 9.21777 10.0889 9.5293 9.91602L10.017 11.1377Z" />
                </svg>
              </div>

              <div className="flex flex-col items-center">
                {/* User Avatar with Ring */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-[#C89B3C] blur-xl opacity-20 rounded-full animate-pulse"></div>
                  <img 
                    src={testimonials[testimonialIdx].avatar} 
                    alt={testimonials[testimonialIdx].name} 
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl relative z-10 object-cover" 
                  />
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(star => (
                    <svg key={star} className="w-5 h-5 text-[#C89B3C]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-xl sm:text-2xl md:text-3xl text-gray-800 font-medium leading-tight mb-8 max-w-2xl">
                  "{testimonials[testimonialIdx].text}"
                </p>

                {/* User Info */}
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-lg sm:text-xl mb-1">{testimonials[testimonialIdx].name}</div>
                  <div className="text-sm sm:text-base text-[#C89B3C] font-semibold tracking-wide uppercase">Happy Client</div>
                </div>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-3 mt-10">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`h-2.5 rounded-full transition-all duration-300 ${i === testimonialIdx ? 'w-10 bg-[#C89B3C]' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
                  onClick={() => setTestimonialIdx(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

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
 