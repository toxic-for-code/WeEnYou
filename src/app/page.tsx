'use client';
import Link from 'next/link'
import { useState, useEffect } from 'react';

export default function Home() {
  // Search state
  const [search, setSearch] = useState({ city: '', name: '', date: '' });
  const [featuredHalls, setFeaturedHalls] = useState<any[]>([]);
  const [loadingHalls, setLoadingHalls] = useState(true);

  useEffect(() => {
    // Fetch top halls (replace with your real API endpoint as needed)
    fetch('/api/halls?limit=3&sort=rating')
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

  // Handle search submit
  const handleSearch = (e: any) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.city) params.append('city', search.city);
    if (search.name) params.append('name', search.name);
    if (search.date) params.append('date', search.date);
    window.location.href = `/halls?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[650px] flex items-center justify-center overflow-hidden bg-gray-900">
        {/* Vibrant background image */}
        <img src="https://images.unsplash.com/photo-1515168833906-d2a3b82b302b?auto=format&fit=crop&w=1500&q=80" alt="Event" className="absolute inset-0 w-full h-full object-cover object-center opacity-60" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-purple-900/70 to-primary-600/80" />
        {/* Confetti SVG accent */}
        <svg className="absolute top-0 left-0 w-full h-32 z-10" viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="40" r="6" fill="#f472b6" />
          <circle cx="300" cy="60" r="4" fill="#facc15" />
          <circle cx="600" cy="30" r="5" fill="#34d399" />
          <circle cx="900" cy="70" r="7" fill="#60a5fa" />
          <circle cx="1200" cy="50" r="5" fill="#f472b6" />
        </svg>
        {/* Modern event illustration */}
        <div className="absolute right-10 bottom-0 hidden md:block z-20">
          <img src="https://undraw.co/api/illustrations/celebration?color=6d28d9" alt="Celebration" className="w-[340px] h-auto" />
        </div>
        <div className="relative z-20 container mx-auto px-4 flex flex-col items-center justify-center text-white h-full animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-extrabold text-center mb-6 drop-shadow-lg animate-fade-in-up">
            Find Your Perfect Event Venue
          </h1>
          <p className="text-2xl text-center mb-8 max-w-2xl drop-shadow animate-fade-in-up delay-100">
            Discover and book the ideal hall for your special occasion. From intimate gatherings to grand celebrations.
          </p>
          {/* Search Bar */}
          {/* (Search bar removed as requested) */}
          <div className="flex gap-4 animate-fade-in-up delay-200">
            <Link href="/halls" className="px-8 py-3 rounded-full bg-primary-600 hover:bg-primary-700 text-lg font-semibold shadow-lg transition-all duration-200">
              Find a Hall
            </Link>
            <Link href="/list-your-hall" className="px-8 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-lg font-semibold shadow-lg transition-all duration-200">
              List Your Hall
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Halls Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 animate-fade-in-up">
            Featured Event Halls
          </h2>
          {loadingHalls ? (
            <div className="text-center py-12 text-lg text-gray-500">Loading featured halls...</div>
          ) : featuredHalls.length === 0 ? (
            <div className="text-center py-12 text-lg text-gray-500">No featured halls found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredHalls.map((hall, i) => (
                <div key={hall._id || i} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <img src={hall.images && hall.images[0] ? hall.images[0] : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'} alt={hall.name} className="h-56 w-full object-cover" />
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold mb-1">{hall.name}</h3>
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-400 mr-1">★ {hall.averageRating ? hall.averageRating.toFixed(1) : '4.5'}</span>
                      <span className="text-gray-500 text-sm">({hall.totalReviews || 0} reviews)</span>
                    </div>
                    <p className="text-gray-600 mb-4">{hall.location && hall.location.city ? hall.location.city : 'Great venue for your event'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-primary-600 font-semibold text-lg">₹{hall.price ? hall.price.toLocaleString() : 'N/A'}/day</span>
                      <Link href={`/halls/${hall._id}`} className="bg-primary-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-primary-700 transition">Book Now</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-pink-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 animate-fade-in-up">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="text-center animate-fade-in-up">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-primary-400 to-pink-400 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Search</h3>
              <p className="text-gray-600">Find venues by city, name, or date</p>
            </div>
            <div className="text-center animate-fade-in-up delay-100">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-pink-400 to-primary-400 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Compare</h3>
              <p className="text-gray-600">See details, reviews, and amenities</p>
            </div>
            <div className="text-center animate-fade-in-up delay-200">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 to-primary-400 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Book</h3>
              <p className="text-gray-600">Reserve your venue instantly online</p>
            </div>
            <div className="text-center animate-fade-in-up delay-300">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-green-400 to-primary-400 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Celebrate</h3>
              <p className="text-gray-600">Enjoy your event and make memories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 animate-fade-in-up">
            What Our Users Say
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-primary-50 to-pink-50 rounded-2xl shadow-xl p-8 text-center animate-fade-in-up">
              <img src={testimonials[testimonialIdx].avatar} alt={testimonials[testimonialIdx].name} className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-primary-200 shadow" />
              <p className="text-xl text-gray-700 mb-4">"{testimonials[testimonialIdx].text}"</p>
              <div className="font-semibold text-primary-700">{testimonials[testimonialIdx].name}</div>
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
      <section className="py-20 bg-gradient-to-br from-primary-50 to-pink-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 animate-fade-in-up">
            Why Choose Eventify
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center animate-fade-in-up">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-primary-400 to-pink-400 shadow-lg">
                {/* Location SVG */}
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Location Based</h3>
              <p className="text-gray-600">Find venues near you or explore destination options</p>
            </div>
            <div className="text-center animate-fade-in-up delay-100">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-pink-400 to-primary-400 shadow-lg">
                {/* Booking SVG */}
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Simple and secure booking process</p>
            </div>
            <div className="text-center animate-fade-in-up delay-200">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 to-primary-400 shadow-lg">
                {/* Verified SVG */}
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Venues</h3>
              <p className="text-gray-600">All venues are verified for quality and safety</p>
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
 