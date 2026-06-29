'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  HeartIcon as HeartOutline
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import InviteCustomizer from '@/components/InviteCustomizer';

// Horizontally scrollable Event type selector chips
const categories = [
  { key: 'wedding', label: 'Wedding', icon: '💍' },
  { key: 'birthday', label: 'Birthday', icon: '🎂' },
  { key: 'anniversary', label: 'Anniversary', icon: '💖' },
  { key: 'corporate', label: 'Corporate', icon: '🏢' },
  { key: 'babyshower', label: 'Baby Shower', icon: '👶' },
  { key: 'engagement', label: 'Engagement', icon: '💍' },
];

interface Template {
  id: number;
  name: string;
  category: string;
  img: string;
  style: 'Minimal' | 'Elegant' | 'Luxury' | 'Traditional' | 'Royal';
  theme: string;
  orientation: 'portrait' | 'landscape' | 'square';
  price: 'free' | 'premium';
  description: string;
  tags: string[];
  // Editor fallback configurations
  header?: string;
  names?: string;
  body?: string;
  details?: string;
  rsvp?: string;
}

const TEMPLATES: Template[] = [
  {
    id: 1,
    name: 'Luxury Royal Wedding',
    category: 'wedding',
    img: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=800&q=80',
    style: 'Luxury',
    theme: 'gold',
    orientation: 'portrait',
    price: 'premium',
    description: 'An opulent royal design embellished with gold floral accents, classic serif typography, and premium board trimming.',
    tags: ['Luxury', 'Elegant', 'Traditional'],
    header: '💍 Together with their families',
    names: 'Aisha Sharma & Raj Verma',
    body: 'Request the honor of your presence as they celebrate their union in marriage.',
    details: '📍 The Grand Orchid Banquet Hall\n📅 Saturday, 10th December 2025\n⏰ 5:00 PM onwards',
    rsvp: 'Please confirm your presence by 1st December.\n📞 +91-9876543210'
  },
  {
    id: 2,
    name: 'Minimal Floral Wedding',
    category: 'wedding',
    img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
    style: 'Minimal',
    theme: 'floral',
    orientation: 'portrait',
    price: 'free',
    description: 'Clean modern layout framed by botanical eucalyptus leaves and soft pastel handwriting script.',
    tags: ['Minimal', 'Elegant', 'Floral'],
    header: '💫 We said Yes!',
    names: 'Nisha & Akash',
    body: 'Join us as we begin our forever.',
    details: 'Venue: Sunset Lawn, Palm Resorts\nDate: 15th January 2026\nTime: 4:30 PM Ceremony, followed by Dinner',
    rsvp: 'Email: weddings@weenyou.com'
  },
  {
    id: 3,
    name: 'Indian Traditional Mandap',
    category: 'wedding',
    img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    style: 'Traditional',
    theme: 'gold',
    orientation: 'portrait',
    price: 'premium',
    description: 'A rich celebration invitation showcasing a traditional Indian mandap silhouette and detailed gold trims.',
    tags: ['Traditional', 'Luxury', 'Mandap'],
    header: "YOU'RE INVITED TO THE WEDDING OF",
    names: 'Jennifer Janet\nand\nFrederick Wilson',
    body: '',
    details: '21 SEPTEMBER 2025\n18:00 - 21:00\n123 ANYWHERE ST., ANY CITY',
    rsvp: '',
  },
  {
    id: 4,
    name: 'South Indian Wedding',
    category: 'wedding',
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    style: 'Traditional',
    theme: 'emerald-green',
    orientation: 'portrait',
    price: 'premium',
    description: 'Vibrant emerald border details surrounding clean Malayalam/Tamil script-ready calligraphy.',
    tags: ['Traditional', 'South Indian', 'Emerald'],
    header: '🌴 Mangala Parinayam Invitation',
    names: 'Hari & Anjali',
    body: 'We request your blessings at our traditional wedding ceremony.',
    details: '📍 Sri Venkateswara Kalyana Mandapam, Chennai\n📅 Sunday, 15th February 2026\n⏰ Muhurtham: 9:00 AM - 10:30 AM',
    rsvp: 'RSVP: +91-9876543220'
  },
  {
    id: 5,
    name: 'Muslim Nikkah Crimson',
    category: 'wedding',
    img: 'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?auto=format&fit=crop&w=800&q=80',
    style: 'Royal',
    theme: 'classic-red',
    orientation: 'landscape',
    price: 'premium',
    description: 'A grand landscape card matching islamic architectural arches and royal crimson gradients.',
    tags: ['Royal', 'Nikkah', 'Crimson'],
    header: '✨ In the Name of Allah, the Merciful',
    names: 'Farhan & Zarina',
    body: 'Invite you to celebrate their Nikkah ceremony and blessings banquet.',
    details: '📍 The Royal Palace Lawn, Hyderabad\n📅 Friday, 21st November 2025\n⏰ Reception: 7:30 PM onwards',
    rsvp: 'RSVP: +91-9000888877'
  },
  {
    id: 6,
    name: 'Christian Wedding White Vows',
    category: 'wedding',
    img: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    style: 'Elegant',
    theme: 'minimal-white',
    orientation: 'portrait',
    price: 'free',
    description: 'Chic minimal canvas layout mapping clean sans serif texts and a subtle lace pattern overlay.',
    tags: ['Elegant', 'Minimal', 'White Vows'],
    header: '⛪ Together with Christ',
    names: 'Sarah & David',
    body: 'Request the honor of your presence to share in their joy as they exchange vows.',
    details: '📍 St. Mary\'s Cathedral, Kochi\n📅 Saturday, 3rd January 2026\n⏰ 3:00 PM Service, Dinner to follow',
    rsvp: 'RSVP at wedlock.com'
  },
  {
    id: 7,
    name: 'Kids Playful Confetti Party',
    category: 'birthday',
    img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    style: 'Minimal',
    theme: 'confetti',
    orientation: 'landscape',
    price: 'free',
    description: 'Colorful sprinkle dots and playful bold texts, perfect for kids or fun adult celebrations.',
    tags: ['Minimal', 'Confetti', 'Playful'],
    header: '🎂 Let\'s Celebrate!',
    names: 'Vihaan\'s 5th Birthday Party',
    body: 'Games, cake, and lots of fun await you!',
    details: '📍 PlayZone Arena, Indiranagar\n📅 Saturday, 14th September 2025\n⏰ 4:00 PM - 7:00 PM',
    rsvp: 'RSVP to Vihaan\'s parents'
  },
  {
    id: 8,
    name: 'Sweet Blossom Baby Shower',
    category: 'babyshower',
    img: 'https://images.unsplash.com/photo-1520121401995-928cd50d4e27?auto=format&fit=crop&w=800&q=80',
    style: 'Elegant',
    theme: 'pastel-pink',
    orientation: 'portrait',
    price: 'free',
    description: 'Soft floral wreath framing a clean cursive welcoming script. Delicate and warm.',
    tags: ['Elegant', 'Pink', 'Baby Shower'],
    header: '👶 Welcome Baby!',
    names: 'Baby Shower in honor of Ritu',
    body: 'A little cutie is on the way! Let\'s shower the mom-to-be with love.',
    details: '📍 Blossom Garden Café, Pune\n📅 Sunday, 9th November 2025\n⏰ 11:30 AM onwards',
    rsvp: 'RSVP: +91-9888877776'
  },
  {
    id: 9,
    name: 'Corporate Black Tie Gala',
    category: 'corporate',
    img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    style: 'Elegant',
    theme: 'modern-black',
    orientation: 'portrait',
    price: 'premium',
    description: 'Sleek black textured background with golden borders and professional formal spacing.',
    tags: ['Elegant', 'Corporate', 'Formal'],
    header: '🏢 WeEnYou Annual Corporate Gala',
    names: 'Corporate Excellence 2025',
    body: 'Under the stars, we celebrate the milestones of the year.',
    details: '📍 Grand Ballroom, Ritz Carlton\n📅 Thursday, 18th December 2025\n⏰ 7:00 PM Reception',
    rsvp: 'Dress Code: Black Tie / Formal'
  },
  {
    id: 10,
    name: 'Engagement Gold Rings',
    category: 'engagement',
    img: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&w=800&q=80',
    style: 'Traditional',
    theme: 'luxury-gold',
    orientation: 'landscape',
    price: 'free',
    description: 'Gold foil rings design mapping clean script and geometric layouts.',
    tags: ['Traditional', 'Gold', 'Rings'],
    header: '💍 Ring Ceremony Invitation',
    names: 'Kavya & Sameer',
    body: 'We invite you to celebrate our engagement.',
    details: '📍 Palace Heights Banquet, Mumbai\n📅 Sunday, 5th October 2025\n⏰ 6:30 PM onwards',
    rsvp: 'RSVP: +91-9999888877'
  },
  {
    id: 11,
    name: 'Silver Anniversary Sapphire',
    category: 'anniversary',
    img: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    style: 'Elegant',
    theme: 'royal-blue',
    orientation: 'landscape',
    price: 'free',
    description: 'Watercolor sapphire backdrop mapping classic Roman serif texts.',
    tags: ['Elegant', 'Watercolor', 'Sapphire'],
    header: '💖 25 Years of Togetherness',
    names: 'Suresh & Meena Goel',
    body: 'Join us to raise a toast to 25 years of love and laughter.',
    details: '📍 Sapphire Hall, The Oberoi\n📅 Friday, 28th November 2025\n⏰ 7:30 PM onwards',
    rsvp: 'RSVP by November 15th'
  }
];

const POPULAR_COLLECTIONS = [
  { name: 'Luxury Weddings', image: 'https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=400&q=80', tag: 'Luxury' },
  { name: 'Minimal Collection', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80', tag: 'Minimal' },
  { name: 'Floral Collection', image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80', tag: 'Floral' },
  { name: 'Traditional Indian', image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80', tag: 'Traditional' },
  { name: 'Modern Invitations', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=400&q=80', tag: 'Modern' }
];

export default function EInvitesPage() {
  const [selectedCategory, setSelectedCategory] = useState('wedding');
  const [customizing, setCustomizing] = useState<null | any>(null);
  
  // Search bar details
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(['Wedding', 'Gala', 'Floral']);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filters State
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedOrientation, setSelectedOrientation] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Popular');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Favorites
  const [favorites, setFavorites] = useState<number[]>([]);

  // Preview overlay details
  const [previewTemplate, setPreviewTemplate] = useState<null | Template>(null);

  const shouldReduceMotion = useReducedMotion();
  const templatesSectionRef = useRef<HTMLDivElement>(null);
  const howItWorksSectionRef = useRef<HTMLDivElement>(null);

  // Read favorites from local storage on mount
  useEffect(() => {
    const savedFavs = localStorage.getItem('weenyou_favorite_invites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (err) {
        console.error('Failed to parse favorites:', err);
      }
    }
  }, []);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem('weenyou_favorite_invites', JSON.stringify(updated));
  };

  const handleScrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Search input actions
  const selectSuggestion = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    
    // Add to recent
    if (!recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 3)]);
    }
  };

  // Filter templates list
  const filteredTemplates = TEMPLATES.filter(tpl => {
    const matchesCategory = tpl.category === selectedCategory;
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tpl.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStyle = selectedStyle === 'All' || tpl.style === selectedStyle;
    const matchesColor = selectedColor === 'All' || tpl.theme === selectedColor.toLowerCase();
    const matchesOrientation = selectedOrientation === 'All' || tpl.orientation === selectedOrientation.toLowerCase();
    const matchesPrice = selectedPrice === 'All' || tpl.price === selectedPrice.toLowerCase();

    return matchesCategory && matchesSearch && matchesStyle && matchesColor && matchesOrientation && matchesPrice;
  }).sort((a, b) => {
    if (selectedSort === 'Newest') return b.id - a.id;
    return a.id - b.id; // Popular sort fallback
  });

  // Editor route launch
  if (customizing) {
    return (
      <div className="min-h-screen bg-[#FCFCFC] py-8 sm:py-16 px-4 sm:px-6 lg:px-10 w-full min-w-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <InviteCustomizer template={customizing} onBack={() => setCustomizing(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFC] font-sans pb-20 relative">
      
      {/* Hero Section */}
      <section className="relative w-full py-16 lg:py-24 px-6 sm:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 border-b border-gray-100">
        
        {/* Left Info Block */}
        <div className="flex-1 text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#C89B3C]/10 border border-[#C89B3C]/20 px-3.5 py-1.5 rounded-full text-[#C89B3C] text-xs font-bold uppercase tracking-wider"
          >
            <SparklesIcon className="w-4 h-4" />
            <span>New Feature</span>
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Create Beautiful <br />
            <span className="bg-gradient-to-r from-[#C89B3C] to-[#e0b555] bg-clip-text text-transparent">Digital Invitations</span>
          </h1>
          
          <p className="text-gray-500 text-lg sm:text-xl leading-relaxed max-w-xl font-medium">
            Design elegant invitations for weddings, birthdays, anniversaries and more. Send instantly via WhatsApp or Email while tracking RSVPs effortlessly.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => handleScrollTo(templatesSectionRef)}
              className="px-8 py-4 bg-gradient-to-r from-[#C89B3C] to-[#e0b555] text-white font-bold text-[15px] rounded-full shadow-[0_8px_30px_rgba(200,155,60,0.2)] hover:shadow-[0_12px_35px_rgba(200,155,60,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-[#b58931]/30"
            >
              Browse Templates
            </button>
            <button
              onClick={() => handleScrollTo(howItWorksSectionRef)}
              className="px-8 py-4 bg-white text-gray-800 font-bold text-[15px] rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all border border-gray-200 cursor-pointer"
            >
              How it Works
            </button>
          </div>
        </div>

        {/* Right Illustration Block */}
        <div className="flex-grow w-full relative h-[380px] sm:h-[450px] max-w-lg lg:max-w-xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#C89B3C]/5 to-[#e0b555]/10 rounded-[40px] blur-3xl opacity-60 z-0"></div>
          
          <div className="absolute inset-0 flex items-center justify-center z-10 select-none">
            
            {/* Template Card Mockup */}
            <motion.div
              initial={{ opacity: 0, x: -30, rotate: -6 }}
              animate={{ opacity: 1, x: 0, rotate: -6 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.2 }}
              whileHover={{ rotate: -2, y: -5 }}
              className="absolute left-[5%] top-[15%] w-[240px] sm:w-[280px] bg-white border border-gray-100 rounded-[24px] p-4 shadow-[0_15px_40px_rgba(0,0,0,0.06)]"
            >
              <div className="aspect-[16/10] bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-50 mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1607190074257-dd4b7af0309f?auto=format&fit=crop&w=300&q=80" 
                  alt="Mock Wedding"
                  className="object-cover w-full h-full" 
                />
                <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase">Wedding</span>
              </div>
              <div className="font-bold text-gray-800 text-sm">Luxury Royal Invitation</div>
              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">Classic Gold Theme</div>
            </motion.div>

            {/* Sharing Methods Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 4 }}
              animate={{ opacity: 1, y: 0, rotate: 4 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.35 }}
              whileHover={{ rotate: 1, y: -5 }}
              className="absolute right-[5%] bottom-[10%] w-[200px] sm:w-[230px] bg-white border border-gray-100 rounded-[24px] p-4.5 shadow-[0_15px_40px_rgba(0,0,0,0.08)] flex flex-col gap-3"
            >
              <div className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-400">Share Instantly</div>
              
              <div className="flex items-center gap-3.5 bg-green-50/50 p-2.5 rounded-xl border border-green-100/50">
                <div className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-900">WhatsApp Delivery</div>
                  <div className="text-[10px] text-green-600 font-bold">Ready to send</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100/50">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <EnvelopeIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-900">Email Broadcast</div>
                  <div className="text-[10px] text-blue-600 font-bold">1-click delivery</div>
                </div>
              </div>
            </motion.div>

            {/* Analytics Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -40, rotate: 10 }}
              animate={{ opacity: 1, x: 0, y: -40, rotate: 10 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 0.5 }}
              whileHover={{ rotate: 5, y: -45 }}
              className="absolute right-[10%] top-[18%] w-[190px] bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_15px_30px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide">RSVP Tracking</span>
                <ChartBarIcon className="w-4.5 h-4.5 text-[#C89B3C]" />
              </div>
              <div className="text-2xl font-black text-gray-900 tracking-tight">84%</div>
              <div className="text-[10px] font-bold text-green-600 mb-2">Acceptance Rate</div>
              
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#C89B3C] to-[#e0b555] h-full rounded-full w-[84%]"></div>
              </div>
              <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 mt-2">
                <span>120 Going</span>
                <span>15 Pending</span>
              </div>
            </motion.div>

          </div>
        </div>

      </section>

      {/* Event type selectors scrollable */}
      <section className="py-10 max-w-7xl mx-auto px-6 sm:px-8 border-b border-gray-50">
        <div className="w-full flex flex-col items-center">
          <div className="w-full overflow-x-auto pb-4 md:pb-0 scrollbar-hide flex items-center gap-3 md:justify-center">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-[14px] transition-all duration-300 border flex-shrink-0 cursor-pointer ${
                    isActive 
                      ? 'bg-[#C89B3C] text-white border-[#C89B3C] shadow-[0_8px_20px_rgba(200,155,60,0.25)] scale-102'
                      : 'bg-white text-gray-700 border-gray-200/80 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature bar pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {[
            { text: 'Fully Customizable', icon: '✨' },
            { text: 'WhatsApp Ready', icon: '📲' },
            { text: 'Email Delivery', icon: '📧' },
            { text: 'RSVP Tracking', icon: '📊' },
            { text: 'Instant Sharing', icon: '⚡' }
          ].map((pill, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full text-xs font-bold text-gray-500"
            >
              <span>{pill.icon}</span>
              <span>{pill.text}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Main Templates Display Section */}
      <section ref={templatesSectionRef} id="templates" className="py-16 max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Title, Search & Filters header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-25">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 font-['Plus_Jakarta_Sans',sans-serif]">
              Browse {categories.find(c => c.key === selectedCategory)?.label} Templates
            </h2>
            <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase">
              {filteredTemplates.length} templates found
            </p>
          </div>

          {/* Sticky-like search and filters wrapper */}
          <div className="flex items-center gap-3 w-full md:w-auto relative">
            
            {/* Search Input with autocomplete suggestions dropdown */}
            <div className="relative flex-1 md:w-72">
              <input
                type="text"
                placeholder="Search templates, tags..."
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200/80 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none bg-white shadow-inner"
              />
              <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              
              {/* Autocomplete dropdown suggestions */}
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl p-4.5 z-50 text-left space-y-4"
                  >
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Suggestions</div>
                      <div className="flex flex-wrap gap-2">
                        {['Gold', 'Floral', 'Minimal', 'Traditional', 'Nikkah', 'Royal'].map(tag => (
                          <button
                            key={tag}
                            onMouseDown={() => selectSuggestion(tag)}
                            className="px-3 py-1 bg-gray-50 border border-gray-100 hover:border-[#C89B3C]/50 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {recentSearches.length > 0 && (
                      <div className="border-t border-gray-50 pt-3">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Recent Searches</div>
                        <ul className="space-y-1.5">
                          {recentSearches.map((term, i) => (
                            <li 
                              key={i} 
                              onMouseDown={() => selectSuggestion(term)}
                              className="text-xs font-bold text-gray-600 hover:text-[#C89B3C] cursor-pointer flex items-center gap-1.5"
                            >
                              <span>🕒</span> {term}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="flex items-center gap-2 px-5 py-3 border border-gray-200/80 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold shadow-sm transition-colors cursor-pointer"
            >
              <FunnelIcon className="w-4.5 h-4.5 text-gray-400" />
              <span>Filters</span>
              {(selectedStyle !== 'All' || selectedColor !== 'All' || selectedOrientation !== 'All' || selectedPrice !== 'All') && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#C89B3C]" />
              )}
            </button>
          </div>
        </div>

        {/* Template Cards Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl p-10 max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-[#C89B3C]/10 border border-[#C89B3C]/15 rounded-full flex items-center justify-center text-[#C89B3C] mx-auto mb-4">
              <MagnifyingGlassIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No templates match filters</h3>
            <p className="text-sm text-gray-500 mb-6">Try clearing your filters or changing your search query to explore more designs.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStyle('All');
                setSelectedColor('All');
                setSelectedOrientation('All');
                setSelectedPrice('All');
                setSelectedSort('Popular');
              }}
              className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredTemplates.map((tpl) => (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[24px] overflow-hidden border border-gray-100/70 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(200,155,60,0.05)] hover:border-[#C89B3C]/30 transition-all duration-400 flex flex-col h-full group relative"
              >
                
                {/* 16:9 Invitation Preview container */}
                <div className="aspect-[16/9] w-full bg-gray-50 relative overflow-hidden group-hover:scale-[1.01] transition-transform duration-300">
                  <img 
                    src={tpl.img} 
                    alt={tpl.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                  />
                  
                  {/* Backdrop Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                      onClick={() => setPreviewTemplate(tpl)}
                      className="px-4.5 py-2 bg-white text-gray-900 rounded-full font-bold text-xs shadow-md hover:bg-gray-100 transition-colors transform translate-y-3 group-hover:translate-y-0 duration-300 cursor-pointer"
                    >
                      Quick Preview
                    </button>
                    <button
                      onClick={() => setCustomizing(tpl)}
                      className="px-4.5 py-2 bg-[#C89B3C] text-white rounded-full font-bold text-xs shadow-md hover:bg-[#b58931] transition-colors transform translate-y-3 group-hover:translate-y-0 duration-300 cursor-pointer"
                    >
                      Customize
                    </button>
                  </div>

                  {/* Favorite toggle icon */}
                  <button
                    onClick={(e) => toggleFavorite(tpl.id, e)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all text-[#C89B3C] hover:bg-white z-20 cursor-pointer"
                    aria-label="Add to favorites"
                  >
                    {favorites.includes(tpl.id) ? (
                      <HeartSolid className="w-4.5 h-4.5" />
                    ) : (
                      <HeartOutline className="w-4.5 h-4.5" />
                    )}
                  </button>

                  {/* Badges on preview */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {tpl.price === 'premium' && (
                      <span className="bg-gradient-to-r from-[#C89B3C] to-[#e0b555] text-white text-[9px] font-black tracking-widest px-2 py-0.5 rounded uppercase shadow-sm">
                        Premium
                      </span>
                    )}
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[9px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-full uppercase border border-gray-100 shadow-sm">
                      {tpl.orientation}
                    </span>
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-5 flex-grow flex flex-col justify-between text-left">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-[#C89B3C] uppercase tracking-wider">{tpl.style}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{tpl.category}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-[15px] leading-snug tracking-tight mb-2.5 group-hover:text-[#C89B3C] transition-colors duration-300">
                      {tpl.name}
                    </h3>
                    <p className="text-gray-500 text-xs leading-relaxed mb-4 font-medium line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>

                  {/* Tags & Action row */}
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-4.5">
                      {tpl.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="bg-gray-50 border border-gray-100 text-gray-500 text-[10px] font-semibold px-2.5 py-1 rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 border-t border-gray-50 pt-4">
                      <button
                        onClick={() => setCustomizing(tpl)}
                        className="flex-1 py-3 bg-gray-50 hover:bg-[#C89B3C] text-gray-700 hover:text-white rounded-xl text-xs font-bold border border-gray-100 hover:border-[#C89B3C] transition-all duration-300 text-center cursor-pointer"
                      >
                        Customize
                      </button>
                      <button
                        onClick={() => setPreviewTemplate(tpl)}
                        className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-xl border border-gray-100 transition-colors flex items-center justify-center cursor-pointer"
                        aria-label="Preview template"
                      >
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                    </div>
                  </div>

                </div>

              </motion.div>
            ))}
          </div>
        )}

      </section>

      {/* Popular Collections Section */}
      <section className="py-16 bg-[#FAFAFA] border-t border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="mb-10 text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Popular Collections
            </h2>
            <p className="text-gray-500 text-sm mt-1">Explore our handpicked curation of luxury template bundles.</p>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
            {POPULAR_COLLECTIONS.map((col, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedStyle(col.tag);
                  handleScrollTo(templatesSectionRef);
                }}
                className="w-[200px] sm:w-[240px] flex-shrink-0 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer relative group"
              >
                <div className="h-[140px] w-full relative">
                  <img src={col.image} alt={col.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-4 absolute bottom-0 left-0 right-0 text-white text-left">
                  <div className="font-bold text-sm tracking-tight">{col.name}</div>
                  <div className="text-[10px] text-gray-300 font-medium tracking-wide uppercase mt-0.5">Explore bundle</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksSectionRef} id="how-it-works" className="py-24 max-w-7xl mx-auto px-6 sm:px-8">
        
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4 font-['Plus_Jakarta_Sans',sans-serif]">
            How it Works
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Create and send digital invitations to your guests in four simple steps.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative mt-12">
          
          {/* Desktop connecting line */}
          <div className="hidden lg:block absolute top-[50px] left-[10%] right-[10%] h-0.5 bg-gray-100 z-0"></div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-6 relative z-10">
            {[
              { step: '1', title: 'Choose Template', desc: 'Browse our catalog of realistic designer mockups and select your perfect style.', icon: '🎨' },
              { step: '2', title: 'Customize Layout', desc: 'Use our real-time editor to personalize wedding text, upload maps, or add photos.', icon: '✍️' },
              { step: '3', title: 'Share with Guests', desc: 'Instantly download images, PDFs, generate QR codes, or broadcast via WhatsApp.', icon: '📲' },
              { step: '4', title: 'Track RSVPs', desc: 'Monitor your digital dashboard to view guest headcounts, comments, and reminders.', icon: '📊' }
            ].map((node, i) => (
              <div 
                key={i}
                className="flex flex-row lg:flex-col items-start lg:items-center text-left lg:text-center group gap-4 lg:gap-0"
              >
                
                {/* Step Circle with timeline connector overlay for mobile */}
                <div className="relative flex flex-col items-center">
                  <div className="w-[100px] h-[100px] rounded-full bg-white border border-gray-100 shadow-md group-hover:border-[#C89B3C] group-hover:shadow-[0_10px_25px_rgba(200,155,60,0.15)] transition-all duration-300 flex items-center justify-center text-3xl mb-4 relative z-10 shrink-0">
                    {node.icon}
                  </div>
                  {/* Mobile connecting vertical line */}
                  {i < 3 && (
                    <div className="lg:hidden absolute top-[100px] w-0.5 bg-gray-100 h-10 z-0"></div>
                  )}
                </div>

                <div>
                  <div className="text-[10px] font-black text-[#C89B3C] uppercase tracking-wider mb-1">Step {node.step}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 font-['Plus_Jakarta_Sans',sans-serif]">{node.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{node.desc}</p>
                </div>

              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Why WeEnYou Section */}
      <section className="py-24 bg-[#FAFAFA] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4 font-['Plus_Jakarta_Sans',sans-serif]">
              Why Design with WeEnYou
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              Experience the highest polish in digital event planning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {[
              { title: 'Unlimited Edits', desc: 'Plans changed? Edit your invitation details at any time. The RSVP links update instantly.', icon: '🔄' },
              { title: 'Instant Delivery', desc: 'No printing delays. Send personalized cards to hundreds of guests in less than 5 minutes.', icon: '⚡' },
              { title: 'Works on Every Device', desc: 'Guests can view invitations, locate venues via Google Maps, and RSVP from any smartphone.', icon: '📱' },
              { title: 'Easy Guest Management', desc: 'Import guest sheets via CSV, categorize groups, and export final guest lists effortlessly.', icon: '👥' },
              { title: 'Professional Designs', desc: 'Beautiful template structures handcrafted by top Indian designers for a high-end feel.', icon: '🎨' },
              { title: 'Secure & Ad-Free', desc: 'Your private event detail pages are secure and completely free of spam or third-party ads.', icon: '🛡️' }
            ].map((feat, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.03)] hover:-translate-y-1 transition-all duration-300 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-2 font-['Plus_Jakarta_Sans',sans-serif]">{feat.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 max-w-7xl mx-auto px-6 sm:px-8 text-center">
        <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-r from-gray-900 to-black text-white py-16 px-8 sm:px-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C89B3C]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Ready to Create Your Invitation?
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto font-medium">
              Design, personalize and send invitations in minutes. Start crafting your celebration details today.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleScrollTo(templatesSectionRef)}
                className="px-10 py-4 bg-gradient-to-r from-[#C89B3C] to-[#e0b555] text-white font-bold text-base rounded-full shadow-[0_8px_30px_rgba(200,155,60,0.3)] hover:shadow-[0_12px_35px_rgba(200,155,60,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-[#b58931]/30 cursor-pointer"
              >
                Start Designing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Bottom CTA for Mobile */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => handleScrollTo(templatesSectionRef)}
          className="flex items-center gap-2 bg-[#C89B3C] text-white px-6 py-3.5 rounded-full font-bold text-sm shadow-[0_8px_20px_rgba(200,155,60,0.35)] active:scale-95 transition-all border border-[#b58931]/20 cursor-pointer"
        >
          <SparklesIcon className="w-4 h-4" />
          <span>Start Designing</span>
        </button>
      </div>

      {/* Advanced Filters Drawer Sidebar (Mobile Bottom Sheet) */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Sidebar drawer content */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-[300px] max-w-full bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="text-left">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">Filters</h3>
                  <button 
                    onClick={() => setIsFilterDrawerOpen(false)} 
                    className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-50 cursor-pointer"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Style Filter */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Style</label>
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Minimal', 'Elegant', 'Luxury', 'Traditional', 'Royal'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setSelectedStyle(st)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                            selectedStyle === st 
                              ? 'bg-[#C89B3C] text-white border-[#C89B3C]' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Color Filter */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Color Theme</label>
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Gold', 'Floral', 'Blue', 'Pink', 'Confetti', 'Tech', 'Emerald-Green', 'Classic-Red', 'Minimal-White', 'Pastel-Pink', 'Modern-Black'].map((col) => (
                        <button
                          key={col}
                          onClick={() => setSelectedColor(col)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            selectedColor === col 
                              ? 'bg-[#C89B3C] text-white border-[#C89B3C]' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {col.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orientation Filter */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Orientation</label>
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Portrait', 'Landscape', 'Square'].map((ori) => (
                        <button
                          key={ori}
                          onClick={() => setSelectedOrientation(ori)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                            selectedOrientation === ori 
                              ? 'bg-[#C89B3C] text-white border-[#C89B3C]' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {ori}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing Filter */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Price Type</label>
                    <div className="flex flex-wrap gap-2">
                      {['All', 'Free', 'Premium'].map((pr) => (
                        <button
                          key={pr}
                          onClick={() => setSelectedPrice(pr)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                            selectedPrice === pr 
                              ? 'bg-[#C89B3C] text-white border-[#C89B3C]' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {pr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort Filter */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Sort By</label>
                    <div className="flex flex-wrap gap-2">
                      {['Popular', 'Newest'].map((sort) => (
                        <button
                          key={sort}
                          onClick={() => setSelectedSort(sort)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                            selectedSort === sort 
                              ? 'bg-[#C89B3C] text-white border-[#C89B3C]' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {sort}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset/Submit actions */}
              <div className="border-t border-gray-100 pt-4 flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedStyle('All');
                    setSelectedColor('All');
                    setSelectedOrientation('All');
                    setSelectedPrice('All');
                    setSelectedSort('Popular');
                  }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 text-center cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black text-center cursor-pointer"
                >
                  Apply
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Template Quick Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewTemplate(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 z-10 flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[85vh]"
              role="dialog"
              aria-modal="true"
            >
              {/* Close Button */}
              <button
                onClick={() => setPreviewTemplate(null)}
                className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-700 bg-white/95 md:bg-gray-100 hover:bg-gray-200 shadow-sm z-20 cursor-pointer"
                aria-label="Close preview"
              >
                <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Preview Image Left Column */}
              <div className="flex-1 bg-gray-50 relative flex items-center justify-center min-h-[250px] md:min-h-[450px]">
                <img 
                  src={previewTemplate.img} 
                  alt={previewTemplate.name} 
                  className="object-cover w-full h-full absolute inset-0"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>

              {/* Details Right Column */}
              <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between overflow-y-auto bg-white text-left">
                <div>
                  <div className="text-[10px] font-black text-[#C89B3C] uppercase tracking-wider mb-1.5">{previewTemplate.style} Design</div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif] mb-3">
                    {previewTemplate.name}
                  </h3>
                  
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">
                    {previewTemplate.description}
                  </p>

                  <div className="space-y-3.5 mb-8">
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 text-base">
                        📐
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Orientation</div>
                        <div className="text-[11px] text-gray-500 font-semibold uppercase">{previewTemplate.orientation} layout</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 text-base">
                        ✨
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Theme Color</div>
                        <div className="text-[11px] text-gray-500 font-semibold uppercase">{previewTemplate.theme} theme</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 text-base">
                        🏷️
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Pricing Tier</div>
                        <div className="text-[11px] text-gray-500 font-semibold uppercase">{previewTemplate.price} template</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPreviewTemplate(null);
                      setCustomizing(previewTemplate);
                    }}
                    className="flex-1 py-3.5 bg-gradient-to-r from-[#C89B3C] to-[#e0b555] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all text-center border border-[#b58931]/20 cursor-pointer"
                  >
                    Customize Template
                  </button>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="px-5 py-3.5 border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 rounded-xl text-sm font-bold transition-all text-center cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}