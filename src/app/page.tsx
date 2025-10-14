'use client';
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { MapPinIcon, CalendarIcon, UsersIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// Removed eventTypes, now using date range
const capacities = ['Any cap', '50+', '100+', '200+', '500+', '1000+'];

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [vendorsMenuOpen, setVendorsMenuOpen] = useState(false);
  const vendorsMenuTimeout = useRef<NodeJS.Timeout | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [nearMeLoading, setNearMeLoading] = useState(false);

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

  const vendorCategories = [
    { title: 'Decor & Ambience', items: ['Decorators', 'Floral decorators', 'Thematic decorators', 'Balloon decorators', 'Lighting & Sound Specialists', 'Furniture Rentals', 'Sofas', 'Chairs', 'Stage setups'] },
    { title: 'Food & Catering', items: ['Caterers', 'Multi-cuisine caterers', 'Specialty cuisine (e.g., Jain, South Indian, Mughlai)', 'Bartenders & Beverage Services', 'Wedding Cakes & Desserts'] },
    { title: 'Photography & Videography', items: ['Photographers', 'Wedding photographers', 'Pre-wedding shoots', 'Event photographers', 'Videographers', 'Cinematic wedding films', 'Drone shoots', 'Photo Booth Rentals'] },
    { title: 'Beauty & Grooming', items: ['Makeup Artists', 'Hair Stylists', 'Mehendi (Henna) Artists', 'Spa & Grooming Services'] },
    { title: 'Entertainment', items: ['Live Bands', 'DJs', 'Anchors & Emcees', 'Dance Troupes', 'Magicians / Artists', 'Fireworks Suppliers'] },
    { title: 'Wedding Planning & Coordination', items: ['Wedding Planners', 'Event Managers', 'Day-of Coordinators'] },
    { title: 'Apparel & Accessories', items: ['Bridal Wear Designers', 'Groom Wear Designers', 'Jewellery Designers'] },
    { title: 'Gifts & Favors', items: ['Invitation Designers (E-Invites & Print)', 'Return Gift Suppliers', 'Custom Favor Makers'] },
    { title: 'Transportation & Logistics', items: ['Car Rentals (Luxury Cars, Vintage Cars)', 'Guest Transport & Logistics'] },
    { title: 'Miscellaneous Services', items: ['Pandit / Priest Services', 'Tent & Canopy Suppliers', 'Event Insurance Providers', 'Security Services'] },
  ];

  useEffect(() => {
    fetch('/api/halls/featured')
      .then(res => res.json())
      .then(data => setFeaturedHalls(data.halls || []))
      .catch(() => setFeaturedHalls([]))
      .finally(() => setLoadingHalls(false));
  }, []);

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
    const params = new URLSearchParams({
      city,
      startDate,
      endDate,
      capacity,
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
    <div className="min-h-screen bg-[#f6f5f2]">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 flex items-center justify-between px-2 py-2 bg-white/95 shadow relative backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image src="/logo.png" alt="WeEnYou Logo" width={100} height={48} className="object-contain cursor-pointer" style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }} />
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileNavOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex gap-6 items-center text-[#22313f] font-medium relative">
          <div
            className="relative"
            onMouseEnter={() => {
              if (vendorsMenuTimeout?.current) clearTimeout(vendorsMenuTimeout.current);
              setVendorsMenuOpen(true);
            }}
            onMouseLeave={() => {
              vendorsMenuTimeout.current = setTimeout(() => setVendorsMenuOpen(false), 100);
            }}
          >
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={vendorsMenuOpen}
              tabIndex={0}
              className="hover:text-[#1a2433] px-2 py-1 font-medium focus:outline-none"
              onClick={e => e.preventDefault()}
            >
              Find Vendors
            </button>
            {vendorsMenuOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[1100px] max-w-[98vw] bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-6 text-sm max-h-[75vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
                {vendorCategories.map((cat, idx) => (
                  <div key={cat.title} className={`min-w-[200px] mb-2 px-4 ${idx !== 0 ? 'border-l border-gray-200' : ''}`}> {/* Section divider */}
                    <div className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1">{cat.title}</div>
                    <ul className="space-y-1">
                      {cat.items.map((item) => (
                        <li key={item}>
                          <a href="#" onClick={e => e.preventDefault()} className="block hover:bg-gray-100 hover:text-[#1a2433] text-gray-700 py-1 px-2 rounded transition-colors duration-150">{item}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
          <a href="/e-invites" className="hover:text-[#1a2433]">Send E-Invites</a>
          <a href="/ideas-tips" className="hover:text-[#1a2433]">Ideas & Tips</a>
          <a href="/plan-event" className="hover:text-[#1a2433]">Plan Your Event</a>
          <a href="/owner-auth" className="hover:text-[#1a2433]">List Your Hall</a>
          <a href="/become-a-partner" className="hover:text-[#1a2433]">Become a Partner</a>
          {session && session.user ? (
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-white border rounded-full shadow-sm cursor-pointer select-none font-semibold hover:bg-gray-50"
                onClick={() => { window.location.href = '/profile'; }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>Welcome, {session.user.name?.split(' ')[0] || session.user.email || 'User'}</span>
              </div>
              {dropdownOpen && (
                <div className="absolute right-0 mt-0 w-56 bg-white border rounded shadow-lg z-50 animate-fade-in">
                  {session.user.role === 'admin' ? (
                    <Link href="/admin/dashboard" className="block px-4 py-3 hover:bg-gray-100">Admin Panel</Link>
                  ) : (
                    <Link href="/profile" className="block px-4 py-3 hover:bg-gray-100">My Bookings</Link>
                  )}
                  <Link href="/profile" className="block px-4 py-3 hover:bg-gray-100">My Profile</Link>
                  <a href="tel:+919313931393" className="px-4 py-3 flex items-center gap-2 border-t border-b hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    <span>+91 9313 9313 93</span>
                  </a>
                  <Link href="/help" className="block px-4 py-3 hover:bg-gray-100">Help</Link>
                  <Link href="/about-us" className="block px-4 py-3 hover:bg-gray-100">About Us</Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="block w-full text-left px-4 py-3 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <a href="/auth/signin" className="hover:text-[#1a2433]">Login / Signup</a>
          )}
        </div>
        
        {/* Mobile navigation menu */}
        {mobileNavOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 md:hidden">
            <div className="px-4 py-4 space-y-4">
              <div className="space-y-2">
                <a href="/e-invites" className="block py-2 text-[#22313f] hover:text-[#1a2433]">Send E-Invites</a>
                <a href="/ideas-tips" className="block py-2 text-[#22313f] hover:text-[#1a2433]">Ideas & Tips</a>
                <a href="/plan-event" className="block py-2 text-[#22313f] hover:text-[#1a2433]">Plan Your Event</a>
                <a href="/owner-auth" className="block py-2 text-[#22313f] hover:text-[#1a2433]">List Your Hall</a>
                <a href="/become-a-partner" className="block py-2 text-[#22313f] hover:text-[#1a2433]">Become a Partner</a>
              </div>
              
              {/* Mobile vendors menu */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="font-semibold text-gray-800 mb-2">Find Vendors</div>
                  <div className="grid grid-cols-1 gap-2">
                    {vendorCategories.slice(0, 4).map((cat, idx) => (
                      <div key={cat.title} className="space-y-1">
                        <div className="font-medium text-sm text-gray-700">{cat.title}</div>
                        <div className="space-y-1">
                          {cat.items.slice(0, 3).map((item) => (
                            <a key={item} href="#" onClick={e => e.preventDefault()} className="block text-sm text-gray-600 hover:text-[#1a2433] py-1">
                              {item}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Mobile auth section */}
              <div className="border-t border-gray-200 pt-4">
                {session && session.user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-sm font-medium">Welcome, {session.user.name?.split(' ')[0] || session.user.email || 'User'}</span>
                    </div>
                    <div className="space-y-1">
                      {session.user.role === 'admin' ? (
                        <Link href="/admin/dashboard" className="block py-2 text-sm text-[#22313f] hover:text-[#1a2433]">Admin Panel</Link>
                      ) : (
                        <Link href="/profile" className="block py-2 text-sm text-[#22313f] hover:text-[#1a2433]">My Bookings</Link>
                      )}
                      <Link href="/profile" className="block py-2 text-sm text-[#22313f] hover:text-[#1a2433]">My Profile</Link>
                      <a href="tel:+919313931393" className="flex items-center gap-2 py-2 text-sm text-[#22313f] hover:text-[#1a2433]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2zm8-8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        +91 9313 9313 93
                      </a>
                      <Link href="/help" className="block py-2 text-sm text-[#22313f] hover:text-[#1a2433]">Help</Link>
                      <Link href="/about-us" className="block py-2 text-sm text-[#22313f] hover:text-[#1a2433]">About Us</Link>
                      <button onClick={() => signOut({ callbackUrl: '/' })} className="block w-full text-left py-2 text-sm text-red-600 hover:text-red-700">
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <a href="/auth/signin" className="block w-full text-center py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                      Login / Signup
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Background */}
      <section className="relative w-full h-[400px] sm:h-[480px] md:h-[520px] flex flex-col justify-center items-center text-center overflow-hidden rounded-b-3xl shadow-lg mb-6 sm:mb-10">
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
        <div className="relative z-20 w-full flex flex-col items-center justify-center h-full px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold text-white drop-shadow-lg mb-3 sm:mb-4 animate-fade-in leading-tight">
            Find Your Perfect Venue.<br className="hidden sm:block" />
            <span className="sm:hidden"> </span>For Every Celebration.
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-2xl text-gray-200 mb-4 sm:mb-6 max-w-2xl mx-auto animate-fade-in delay-100 leading-relaxed">
            Discover, compare, and book top-rated banquet halls, event spaces, and more. Make your event unforgettable!
          </p>
          {/* Search Form */}
          <form onSubmit={handleSearch} className="backdrop-blur-md bg-white/80 border border-gray-200 shadow-xl rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-3 items-center w-full max-w-6xl mx-auto mt-4 sm:mt-6 animate-fade-in delay-200">
                <div className="relative w-full">
                  <input
                    ref={cityInputRef}
                    type="text"
                    className="group pl-10 pr-12 py-3 sm:py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 w-full text-base"
                    value={city}
                    onChange={handleCityInput}
                    onBlur={handleCityInputBlur}
                    onFocus={handleCityInputFocus}
                    placeholder="Enter city name"
                    required
                    aria-label="City"
                    aria-autocomplete="list"
                    aria-controls="city-suggestions"
                    aria-expanded={showSuggestions}
                  />
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white hover:bg-gray-100 border border-gray-200 shadow-sm transition-transform duration-150 hover:scale-105 hover:shadow-lg text-xs sm:text-sm min-h-[36px] min-w-[36px] sm:min-h-[32px] sm:min-w-[32px]"
                  onClick={getLocation}
                  aria-label="Use current location for city"
                  disabled={nearMeLoading}
                >
                 {nearMeLoading ? (
                   <svg className="animate-spin w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                   </svg>
                 ) : (
                   <>
                     <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                     <span className="font-medium text-gray-700 hidden sm:inline">Near me</span>
                   </>
                 )}
               </button>
            </div>
            <div className="relative w-full sm:w-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-150 group-hover:scale-110">
                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </span>
              <div className="flex flex-col sm:flex-row gap-2 items-center">
                <input
                  type="date"
                  className="group pl-10 pr-4 py-3 sm:py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 w-full sm:w-auto text-base"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                  aria-label="Start date"
                />
                <span className="text-sm sm:text-base">to</span>
                <input
                  type="date"
                  className="group pl-3 pr-4 py-3 sm:py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 w-full sm:w-auto text-base"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                  aria-label="End date"
                />
              </div>
            </div>
            <div className="relative w-full sm:w-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-150 group-hover:scale-110">
                <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </span>
              <select
                className="group pl-10 pr-4 py-3 sm:py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 w-full sm:w-auto text-base"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                aria-label="Capacity"
              >
                <option value="">Capacity (optional)</option>
                {capacities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-[#22313f] text-white px-6 sm:px-8 py-3 sm:py-2 min-h-[48px] sm:min-h-[44px] rounded font-semibold text-base sm:text-lg shadow-lg hover:bg-[#1a2433] transition transform hover:scale-105 focus:scale-105 duration-150 w-full sm:w-auto"
              aria-label="Search venues"
            >
              <MagnifyingGlassIcon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-150 group-hover:scale-110" aria-hidden="true" />
              <span>Explore</span>
            </button>
          </form>
        </div>
      </section>

      {/* Event Categories */}
      <section className="bg-gray-50 py-6 sm:py-8 px-4 sm:px-0">
        <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 flex-wrap shadow-sm overflow-x-auto border-b border-gray-200 pb-6 sm:pb-8">
          <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] mx-1 sm:mx-2">
            <span className="bg-[#e7dac7] rounded-full p-3 sm:p-4 mb-2"><svg width="24" height="24" className="sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7" /><path d="M8 21h8M12 17v4" /></svg></span>
            <span className="font-medium text-xs sm:text-sm text-center">Weddings</span>
          </div>
          <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] mx-1 sm:mx-2">
            <span className="bg-[#e7dac7] rounded-full p-3 sm:p-4 mb-2"><svg width="24" height="24" className="sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" /><circle cx="12" cy="7" r="4" /></svg></span>
            <span className="font-medium text-xs sm:text-sm text-center">Birthdays</span>
          </div>
          <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] mx-1 sm:mx-2">
            <span className="bg-[#e7dac7] rounded-full p-3 sm:p-4 mb-2"><svg width="24" height="24" className="sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M16 3v4M8 3v4" /></svg></span>
            <span className="font-medium text-xs sm:text-sm text-center">Corporate</span>
          </div>
          <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] mx-1 sm:mx-2">
            <span className="bg-[#e7dac7] rounded-full p-3 sm:p-4 mb-2"><svg width="24" height="24" className="sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4v8l6 3" /></svg></span>
            <span className="font-medium text-xs sm:text-sm text-center">Cultural</span>
          </div>
          <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] mx-1 sm:mx-2">
            <span className="bg-[#e7dac7] rounded-full p-3 sm:p-4 mb-2"><svg width="24" height="24" className="sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2C7.03 2 2.73 6.11 2.07 11h19.86C21.27 6.11 16.97 2 12 2zm0 20c4.97 0 9.27-4.11 9.93-9H2.07c.66 4.89 4.96 9 9.93 9z" /></svg></span>
            <span className="font-medium text-xs sm:text-sm text-center">Religious</span>
          </div>
          <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] mx-1 sm:mx-2">
            <span className="bg-[#e7dac7] rounded-full p-3 sm:p-4 mb-2"><svg width="24" height="24" className="sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 9h16M9 4v16" /></svg></span>
            <span className="font-medium text-xs sm:text-sm text-center">Exhibitions</span>
          </div>
          <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] mx-1 sm:mx-2">
            <span className="bg-[#e7dac7] rounded-full p-3 sm:p-4 mb-2"><svg width="24" height="24" className="sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M16 8a4 4 0 01-8 0" /></svg></span>
            <span className="font-medium text-xs sm:text-sm text-center">Sports</span>
          </div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-10">Featured Venues</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {loadingHalls ? (
              <div className="col-span-3 text-center text-gray-500">Loading featured venues...</div>
            ) : featuredHalls.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500">No featured venues found.</div>
            ) : featuredHalls.slice(0, 3).map((hall, i) => (
              <div key={hall._id || i} className="bg-[#f6f5f2] rounded-xl shadow-lg p-3 sm:p-4 flex flex-col transition-transform duration-200 hover:scale-105 hover:shadow-2xl">
                <Image
                  src={hall.images && hall.images[0] ? hall.images[0] : '/placeholder.jpg'}
                  alt={hall.name}
                  width={400}
                  height={160}
                  className="h-32 sm:h-40 w-full object-cover rounded mb-3 sm:mb-4"
                  style={{objectFit:'cover'}}
                  priority={i === 0}
                  loading={i === 0 ? undefined : 'lazy'}
                />
                <div className="font-semibold text-base sm:text-lg mb-1">{hall.name}</div>
                <div className="text-gray-500 text-xs sm:text-sm mb-1 line-clamp-2">{hall.description}</div>
                <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 text-xs mb-1 gap-1 sm:gap-2">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {hall.location?.city}, {hall.location?.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    {hall.capacity || 'N/A'} guests
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-600 mb-1 gap-2">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                    {hall.averageRating?.toFixed(1) || 'N/A'}
                  </span>
                  <span className="text-gray-400">({hall.totalReviews || 0} reviews)</span>
                </div>
                <div className="flex flex-wrap gap-1 text-xs text-gray-500 mb-2">
                  {Array.isArray(hall.amenities) && hall.amenities.slice(0, 2).map((amenity, idx) => (
                    <span key={idx} className="bg-gray-200 rounded px-1.5 sm:px-2 py-0.5 text-xs">{amenity}</span>
                  ))}
                  {Array.isArray(hall.amenities) && hall.amenities.length > 2 && (
                    <span className="bg-gray-200 rounded px-1.5 sm:px-2 py-0.5 text-xs">+{hall.amenities.length - 2} more</span>
                  )}
                </div>
                <div className="text-gray-800 font-medium mb-2 text-sm sm:text-base">₹{hall.price ? hall.price.toLocaleString() : 'N/A'}{hall.priceType === 'per plate' ? ' per plate' : ''}</div>
                <a
                  href={`/halls/${hall._id}`}
                  className="mt-auto border border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 font-semibold py-2 sm:py-2 px-3 sm:px-4 rounded transition text-center block text-sm sm:text-base"
                  style={{ marginTop: 'auto' }}
                >
                  Book Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 sm:py-12 md:py-16 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center">
              <span className="bg-[#f3e6d2] rounded-full p-3 sm:p-4 mb-2"><svg width="24" height="24" className="sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg></span>
              <div className="font-semibold mb-1 text-sm sm:text-base">Search & Discover</div>
              <div className="text-gray-600 text-xs sm:text-sm">Search verified venues across india.</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="bg-[#f3e6d2] rounded-full p-3 sm:p-4 mb-2"><svg width="24" height="24" className="sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg></span>
              <div className="font-semibold mb-1 text-sm sm:text-base">Request & Confirm</div>
              <div className="text-gray-600 text-xs sm:text-sm">Request booking & confirm instantly</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="bg-[#f3e6d2] rounded-full p-3 sm:p-4 mb-2"><svg width="24" height="24" className="sm:w-8 sm:h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></svg></span>
              <div className="font-semibold mb-1 text-sm sm:text-base">Celebrate & Enjoy</div>
              <div className="text-gray-600 text-xs sm:text-sm">Host your event with peace of mind</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-gray-900 animate-fade-in-up">
            What Our Users Say
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-2xl shadow-xl p-6 sm:p-8 text-center animate-fade-in-up">
              <img src={testimonials[testimonialIdx].avatar} alt={testimonials[testimonialIdx].name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-3 sm:mb-4 border-4 border-primary-200 shadow" />
              <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-3 sm:mb-4">"{testimonials[testimonialIdx].text}"</p>
              <div className="font-semibold text-primary-700 text-sm sm:text-base">{testimonials[testimonialIdx].name}</div>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`w-3 h-3 rounded-full ${i === testimonialIdx ? 'bg-primary-600' : 'bg-gray-300'}`}
                  onClick={() => setTestimonialIdx(i)}
                  aria-label={`Show testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-primary-50 to-pink-50">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-gray-900 animate-fade-in-up">
            Why Choose WeEnYou
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <div className="text-center animate-fade-in-up">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-primary-400 to-pink-400 shadow-lg">
                {/* Location SVG */}
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Location Based</h3>
              <p className="text-gray-600 text-sm sm:text-base">Find venues near you or explore destination options</p>
            </div>
            <div className="text-center animate-fade-in-up delay-100">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-pink-400 to-primary-400 shadow-lg">
                {/* Booking SVG */}
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600 text-sm sm:text-base">Simple and secure booking process</p>
            </div>
            <div className="text-center animate-fade-in-up delay-200 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 to-primary-400 shadow-lg">
                {/* Verified SVG */}
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Verified Venues</h3>
              <p className="text-gray-600 text-sm sm:text-base">All venues are verified for quality and safety</p>
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
 