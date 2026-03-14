"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpenIcon, 
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const categories = [
  "Wedding Planning",
  "Birthday Parties",
  "Corporate Events",
  "Venue Decoration",
  "Catering Ideas",
  "Budget Planning",
  "Event Planning Checklist"
];

const articles = [
  {
    id: 1,
    slug: "how-to-choose-wedding-venue",
    title: "How to Choose the Perfect Wedding Venue",
    description: "Discover the key factors to consider when selecting a venue for your big day, from capacity to location.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
    category: "Wedding Planning"
  },
  {
    id: 2,
    slug: "wedding-venue-mistakes",
    title: "7 Wedding Venue Mistakes to Avoid",
    description: "Don't let these common pitfalls ruin your event. Learn what to look out for during your venue search.",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800",
    category: "Wedding Planning"
  },
  {
    id: 3,
    slug: "birthday-venue-ideas",
    title: "Unique Birthday Venue Ideas",
    description: "Tired of the same old party spots? Explore creative and unique venues that will make your birthday unforgettable.",
    image: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=800",
    category: "Birthday Parties"
  },
  {
    id: 4,
    slug: "corporate-event-planning",
    title: "Planning Successful Corporate Events",
    description: "A comprehensive guide to organizing professional meetings, conferences, and team-building events.",
    image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800",
    category: "Corporate Events"
  },
  {
    id: 5,
    slug: "event-decoration-trends",
    title: "Decoration Trends for Modern Events",
    description: "Stay ahead of the curve with the latest decor trends that are transforming event spaces this year.",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800",
    category: "Venue Decoration"
  },
  {
    id: 6,
    slug: "catering-guide",
    title: "Choosing the Right Catering for Your Event",
    description: "Food is the heart of any event. Learn how to select a menu that caters to all your guests' tastes.",
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800",
    category: "Catering Ideas"
  },
  {
    id: 7,
    slug: "event-budget-planning",
    title: "How to Plan an Event on a Budget",
    description: "Maximize your resources without compromising on quality with these expert budget planning tips.",
    image: "https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=800",
    category: "Budget Planning"
  },
  {
    id: 8,
    slug: "event-planning-checklist",
    title: "Complete Event Planning Checklist",
    description: "Stay organized and on track with our comprehensive step-by-step checklist for any event type.",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800",
    category: "Event Planning Checklist"
  }
];

export default function IdeasTipsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredArticles = activeCategory === "All" 
    ? articles 
    : articles.filter(article => article.category === activeCategory);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-24 px-6 sm:px-8 bg-[#fafafa]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
            Ideas & <span className="text-[#C89B3C]">Tips</span>
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl leading-relaxed">
            Plan smarter events with expert guides, creative ideas, and practical planning tips.
          </p>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="sticky top-[80px] z-20 bg-white/80 backdrop-blur-md border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center overflow-x-auto no-scrollbar gap-3 md:flex-wrap md:justify-center">
            <button
              onClick={() => setActiveCategory("All")}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeCategory === "All" 
                  ? "bg-[#C89B3C] text-white shadow-lg shadow-gold/20" 
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              All Articles
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === category 
                    ? "bg-[#C89B3C] text-white shadow-lg shadow-gold/20" 
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Article Grid */}
      <section className="py-16 sm:py-24 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {filteredArticles.map((article) => (
              <div 
                key={article.id} 
                className="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#C89B3C] shadow-sm">
                      {article.category}
                    </span>
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#C89B3C] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-sm sm:text-base mb-6 line-clamp-3 leading-relaxed">
                    {article.description}
                  </p>
                  <div className="mt-auto">
                    <Link 
                      href={`/ideas-tips/${article.slug}`} 
                      className="inline-flex items-center text-sm font-bold text-[#C89B3C] group/link"
                    >
                      Read More
                      <ChevronRightIcon className="w-4 h-4 ml-1 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
              <BookOpenIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-500">We're still writing these ones! Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Guide */}
      <section className="py-16 sm:py-24 px-6 sm:px-8 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-[3rem] p-8 sm:p-12 lg:p-16 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center gap-10">
            <div className="lg:w-1/2 relative z-10">
              <span className="inline-block px-4 py-1.5 bg-gold/10 text-[#C89B3C] text-xs font-bold rounded-full uppercase tracking-widest mb-6"> Featured Guide </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">The Ultimate 2026 Wedding Venue Checklist</h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                Everything you need to ask when touring a potential venue. From hidden fees to parking logistics, we have you covered.
              </p>
              <Link 
                href="#"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#C89B3C] text-white rounded-2xl font-bold hover:bg-[#b58931] transition-all shadow-lg shadow-gold/20"
              >
                Download Guide
              </Link>
            </div>
            <div className="lg:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1200" 
                alt="Wedding Guide" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-24 sm:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C89B3C] opacity-10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C89B3C] opacity-10 blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6">Plan Your Perfect Event Today</h2>
              <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Explore verified venues and book your ideal event space with ease.
              </p>
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-10 py-5 bg-[#C89B3C] text-white rounded-2xl font-bold text-lg hover:bg-[#b58931] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-gold/20"
              >
                Find Venues
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
