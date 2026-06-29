'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import confetti from 'canvas-confetti';
import { 
  SparklesIcon,
  CheckIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  ChevronDownIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Stepper steps configuration
const WIZARD_STEPS = [
  { id: 1, name: 'Event Type', desc: 'Select celebration' },
  { id: 2, name: 'Details', desc: 'Date, location, guests' },
  { id: 3, name: 'Services', desc: 'Decor, catering, photo' },
  { id: 4, name: 'Budget & Cost', desc: 'Estimated package' },
  { id: 5, name: 'Contact', desc: 'Review & Submit' }
];

const EVENT_TYPES = [
  { key: 'Wedding', label: 'Wedding 💍', icon: '💍', desc: 'Mandaps, catering & decor' },
  { key: 'Birthday', label: 'Birthday 🎂', icon: '🎂', desc: 'Theme decor, games & cakes' },
  { key: 'Corporate', label: 'Corporate 💼', icon: '💼', desc: 'Conferences & gala dinners' },
  { key: 'Baby Shower', label: 'Baby Shower 👶', icon: '👶', desc: 'Floral arches & party favors' },
  { key: 'Anniversary', label: 'Anniversary 💖', icon: '💖', desc: 'Elegant settings & catering' },
  { key: 'Engagement', label: 'Engagement 🎉', icon: '🎉', desc: 'Rings backdrop & banquets' },
  { key: 'Graduation', label: 'Graduation 🎓', icon: '🎓', desc: 'Caps & theme backdrops' },
  { key: 'Housewarming', label: 'Housewarming 🏡', icon: '🏡', desc: 'Traditional setup & family feasts' }
];

const VENUE_TYPES = [
  { key: 'Indoor', label: 'Indoor Banquet', icon: '🏢' },
  { key: 'Outdoor', label: 'Green Lawn', icon: '🌿' },
  { key: 'Resort', label: 'Premium Resort', icon: '🏖️' },
  { key: 'Banquet', label: 'Boutique Hall', icon: '🏛️' },
  { key: 'Farmhouse', label: 'Farmhouse Villa', icon: '🏡' },
  { key: 'Rooftop', label: 'Rooftop Sky-Lounge', icon: '🌇' }
];

const SERVICES_CATALOG = [
  { key: 'photography', label: 'Photography', desc: 'Candid portraits & video coverage', tier: '₹₹', icon: '📷' },
  { key: 'decoration', label: 'Decoration', desc: 'Premium floral stages & lighting', tier: '₹₹₹', icon: '🌸' },
  { key: 'catering', label: 'Catering', desc: 'Multi-cuisine banquets & desserts', tier: '₹₹', icon: '🍽️' },
  { key: 'music', label: 'Entertainment/DJ', desc: 'Live DJs, sound systems & Emcee', tier: '₹', icon: '🎵' },
  { key: 'invitation', label: 'Invitation Cards', desc: 'Premium digital customize invites', tier: '₹', icon: '✉️' },
  { key: 'mehendi', label: 'Mehendi Artists', desc: 'Intricate wedding bridal setups', tier: '₹', icon: '✋' },
  { key: 'makeup', label: 'Bridal Makeup', desc: 'Professional salon hair & makeup', tier: '₹₹', icon: '💄' },
  { key: 'transport', label: 'Guest Transport', desc: 'Luxury cars, coaches & drivers', tier: '₹', icon: '🚗' },
  { key: 'gifts', label: 'Return Gifts', desc: 'Handcrafted luxury party favors', tier: '₹', icon: '🎁' }
];

const CITIES = ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Goa'];

const WHY_WEENYOU = [
  { title: 'Verified Vendors', desc: 'Every service provider is checked for quality & reliability.', icon: '🛡️' },
  { title: 'Transparent Pricing', desc: 'Instant itemized breakdown calculators with zero hidden markups.', icon: '💸' },
  { title: 'Personal Planner', desc: 'Assigned event coordinators act as your co-pilots throughout the planning.', icon: '👥' },
  { title: 'Budget Optimization', desc: 'Intelligent cost allocation algorithms to prevent resource wastes.', icon: '📈' },
  { title: 'Digital Invitations', desc: 'Send personalized digital card packages with live guest RSVP portals.', icon: '✉️' },
  { title: 'Priority Support', desc: 'Round-the-clock lines for booking status, modifications, and emergency updates.', icon: '📞' }
];

const FAQS = [
  { q: 'Will a WeEnYou event manager attend my celebration?', a: 'Yes! A dedicated event coordinator will be present on-site from vendor setups through final guest exits to handle logistics.' },
  { q: 'Can I modify my selections after submitting details?', a: 'Absolutely. Event details are fully editable. You can adjust services, dates, or venues up to 7 days before the event.' },
  { q: 'Are there hidden booking commission fees?', a: 'No. We believe in transparent partnerships. The final budget estimates align directly with partner tariffs without markups.' },
  { q: 'How long does it take to assign a manager?', a: 'We assign your dedicated Event Concierge within 4 hours of submission to schedule a brief introductory call.' }
];

export default function PlanEventPage() {
  const shouldReduceMotion = useReducedMotion();
  const { data: session } = useSession();

  // Wizard active step state
  const [step, setStep] = useState(1);

  // Form State
  const [eventType, setEventType] = useState('');
  const [eventTag, setEventTag] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState(100);
  const [budget, setBudget] = useState(500000);
  const [venueType, setVenueType] = useState('Banquet');
  const [selectedServices, setSelectedServices] = useState<string[]>(['decoration', 'catering']);
  const [themeNotes, setThemeNotes] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [contactTime, setContactTime] = useState('Evening');

  // Submit flow states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // FAQs active indices state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Auto scroll to wizard when user clicks 'Start Planning'
  const wizardSectionRef = useRef<HTMLDivElement>(null);

  const startPlanning = () => {
    wizardSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Perform dynamic real-time package estimation breakdown
  const calculateEstimates = () => {
    const venueCost = Math.round(budget * 0.4);
    const decorCost = selectedServices.includes('decoration') ? Math.round(budget * 0.15) : 0;
    const foodCost = selectedServices.includes('catering') ? Math.round(guests * 750) : 0;
    const photoCost = selectedServices.includes('photography') ? Math.round(budget * 0.12) : 0;
    const othersCost = selectedServices.length * 8000;

    const minEstimate = venueCost + decorCost + foodCost + photoCost + othersCost;
    const maxEstimate = Math.round(minEstimate * 1.25);

    return {
      venue: venueCost,
      decor: decorCost,
      food: foodCost,
      photo: photoCost,
      others: othersCost,
      min: minEstimate,
      max: maxEstimate
    };
  };

  const estimates = calculateEstimates();

  // confettis on submission success
  useEffect(() => {
    if (submitted) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#C89B3C', '#E5C07B', '#A3702C', '#F1C40F', '#111111']
      });
    }
  }, [submitted]);

  // Form submission handler
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    if (!session) {
      signIn();
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        eventType,
        eventTag: eventTag || `${eventType} Celebration`,
        city,
        date,
        guests: String(guests),
        budget: String(budget),
        venueType,
        services: selectedServices,
        theme: themeNotes,
        contactTime,
        phoneNumber,
        userId: session.user.id,
        userName: session.user.name,
        userEmail: session.user.email
      };

      const res = await fetch('/api/plan-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to submit planning request.');
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceToggle = (key: string) => {
    if (selectedServices.includes(key)) {
      setSelectedServices(prev => prev.filter(s => s !== key));
    } else {
      setSelectedServices(prev => [...prev, key]);
    }
  };

  // Step Navigations
  const nextStep = () => {
    if (step === 1 && !eventType) return;
    if (step === 2 && (!city || !date)) return;
    if (step === 5 && !phoneNumber) return;
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  return (
    <div className="bg-[#FCFCFC] min-h-screen text-[#111827] font-sans pb-16 selection:bg-[#C89B3C]/20 overflow-x-hidden">
      
      {/* Premium Hero Section */}
      <section className="relative w-full min-h-[550px] flex items-center justify-center py-20 px-6 overflow-hidden">
        {/* Soft blur visual background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80" 
            alt="Extraordinary Event Planning Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-[#C89B3C]/35 z-10" />
        </div>

        <div className="relative z-20 max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 text-white text-left">
          {/* Left Details Column */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap gap-2.5">
              {['✓ Personalized Planning', '✓ Trusted Partners', '✓ Free Consultation'].map((badge, idx) => (
                <span 
                  key={idx}
                  className="bg-[#C89B3C]/25 border border-[#C89B3C]/35 px-3 py-1 rounded-full text-[#C89B3C] text-[10px] font-bold uppercase tracking-wider"
                >
                  {badge}
                </span>
              ))}
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Let's Plan Something <br />
              <span className="bg-gradient-to-r from-[#C89B3C] to-[#e0b555] bg-clip-text text-transparent">Extraordinary.</span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl">
              Tell us about your event and our experts will curate venues, vendors, budgets, and recommendations tailored just for you.
            </p>

            <div className="pt-2">
              <button
                onClick={startPlanning}
                className="px-10 py-4 bg-gradient-to-r from-[#C89B3C] to-[#e0b555] text-white font-bold text-base rounded-full shadow-[0_8px_30px_rgba(200,155,60,0.3)] hover:shadow-[0_12px_35px_rgba(200,155,60,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-[#b58931]/30 cursor-pointer"
              >
                Start Planning
              </button>
            </div>
          </div>

          {/* Right Concept Illustration */}
          <div className="hidden lg:block w-[400px] h-[340px] rounded-[32px] overflow-hidden shadow-xl border border-white/10 relative shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80" 
              alt="Planner with Client" 
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        </div>
      </section>

      {/* Main Multi-Step Wizard section */}
      <section ref={wizardSectionRef} id="wizard-section" className="py-20 max-w-6xl mx-auto px-6 sm:px-8">
        
        {submitted ? (
          /* Submission success state screen */
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-100 rounded-[32px] p-8 sm:p-16 text-center space-y-6 shadow-md max-w-2xl mx-auto text-left"
          >
            <div className="w-20 h-20 bg-green-50 border border-green-150 rounded-full flex items-center justify-center text-green-500 shadow-inner mx-auto">
              <CheckIcon className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Milestone Plan Submitted!
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              Thank you for trusting WeEnYou. We have assigned a dedicated Event Concierge who will prepare personalized venue options and contact you shortly.
            </p>
            <div className="border-t border-gray-100 pt-6 space-y-4 text-left max-w-sm mx-auto bg-gray-50/50 p-6 rounded-2xl">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Estimate Summary</div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Estimated Cost:</span>
                <span className="font-bold text-green-600">₹{(estimates.min/100000).toFixed(1)}L–₹{(estimates.max/100000).toFixed(1)}L</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Location:</span>
                <span className="font-bold text-gray-800">{city}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Guests Count:</span>
                <span className="font-bold text-gray-800">{guests} guests</span>
              </div>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
              <Link 
                href="/e-invites" 
                className="flex-1 py-3.5 bg-gradient-to-r from-[#C89B3C] to-[#e0b555] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg text-center cursor-pointer border border-[#b58931]/15"
              >
                Send E-Invites
              </Link>
              <button 
                onClick={() => setSubmitted(false)}
                className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer text-center"
              >
                Create Another Plan
              </button>
            </div>
          </motion.div>
        ) : (
          /* Multi-Step Wizard Grid container */
          <div className="w-full flex flex-col lg:flex-row items-stretch gap-10">
            
            {/* Desktop Stepper Column (Left) */}
            <div className="hidden lg:flex w-[26%] flex-col bg-white border border-gray-150 rounded-[28px] p-6 shadow-sm h-fit shrink-0 text-left">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Wizard Progress</div>
              <div className="space-y-6">
                {WIZARD_STEPS.map((s) => {
                  const isActive = step === s.id;
                  const isCompleted = step > s.id;
                  return (
                    <div key={s.id} className="flex items-center gap-3.5 group">
                      <div 
                        className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                          isActive 
                            ? 'bg-[#C89B3C] text-white border-[#C89B3C] shadow-sm'
                            : isCompleted 
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-white text-gray-400 border-gray-200 group-hover:border-[#C89B3C]/50'
                        }`}
                      >
                        {isCompleted ? '✓' : s.id}
                      </div>
                      <div>
                        <div className={`text-xs font-bold tracking-wide uppercase leading-none mb-0.5 ${
                          isActive ? 'text-gray-900' : isCompleted ? 'text-green-600' : 'text-gray-400'
                        }`}>
                          {s.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-semibold">{s.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content Wizard Form (Right) */}
            <div className="flex-1 flex flex-col bg-white border border-gray-150 rounded-[28px] shadow-sm overflow-hidden h-fit">
              
              {/* Wizard progress header (visible on mobile) */}
              <div className="p-6 bg-gray-50/50 border-b border-gray-100 lg:hidden">
                <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  <span>Step {step} of 5</span>
                  <span>{WIZARD_STEPS.find(s => s.id === step)?.name}</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#C89B3C] h-full rounded-full transition-all duration-300"
                    style={{ width: `${(step / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Wizard Slide Window */}
              <div className="p-6 sm:p-10 min-h-[380px] text-left">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 15 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -15 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    
                    {/* Step 1: Event Type */}
                    {step === 1 && (
                      <div className="space-y-5">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif] mb-1">Select Event Type</h3>
                          <p className="text-xs text-gray-500 font-medium">Choose what milestone you are planning with our concierges.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                          {EVENT_TYPES.map((et) => {
                            const isSelected = eventType === et.key;
                            return (
                              <button
                                key={et.key}
                                type="button"
                                onClick={() => setEventType(et.key)}
                                className={`p-4.5 rounded-[24px] border-2 text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-[#C89B3C]/5 border-[#C89B3C] shadow-md ring-1 ring-[#C89B3C]'
                                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                                }`}
                              >
                                <span className="text-3xl leading-none">{et.icon}</span>
                                <div>
                                  <div className="font-bold text-gray-900 text-xs tracking-tight">{et.key}</div>
                                  <div className="text-[10px] text-gray-400 font-semibold mt-0.5 leading-tight">{et.desc}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Event Name (Optional)</label>
                          <input 
                            type="text"
                            placeholder="e.g. Maya's Sangeet"
                            value={eventTag}
                            onChange={(e) => setEventTag(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] text-sm focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 2: Event Details */}
                    {step === 2 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif] mb-1">Details & Location</h3>
                          <p className="text-xs text-gray-500 font-medium">Help our team narrow down options in the right region.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Date Picker */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Preferred Date</label>
                            <div className="relative">
                              <input 
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none cursor-pointer"
                              />
                            </div>
                          </div>

                          {/* City Autocomplete / Buttons */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Select City</label>
                            <select
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              required
                              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none cursor-pointer"
                            >
                              <option value="">Select event city</option>
                              {CITIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Guest Count numeric Stepper (touch targets 48px!) */}
                        <div className="space-y-2 border-t border-gray-50 pt-4.5">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Guest Count</label>
                          <div className="flex items-center gap-3.5">
                            <button
                              type="button"
                              onClick={() => setGuests(prev => Math.max(10, prev - 10))}
                              className="w-12 h-12 border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-lg font-bold rounded-xl flex items-center justify-center active:scale-95 transition-all select-none cursor-pointer"
                            >
                              -
                            </button>
                            <div className="w-28 text-center border border-gray-200 py-3 rounded-xl bg-gray-50 font-bold text-base text-gray-800">
                              {guests} guests
                            </div>
                            <button
                              type="button"
                              onClick={() => setGuests(prev => prev + 10)}
                              className="w-12 h-12 border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-lg font-bold rounded-xl flex items-center justify-center active:scale-95 transition-all select-none cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Venue Type Selection */}
                        <div className="space-y-2.5 border-t border-gray-50 pt-4.5">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Venue Type Preference</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {VENUE_TYPES.map((v) => {
                              const isSelected = venueType === v.key;
                              return (
                                <button
                                  key={v.key}
                                  type="button"
                                  onClick={() => setVenueType(v.key)}
                                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                    isSelected 
                                      ? 'bg-[#C89B3C] text-white border-[#C89B3C]'
                                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                  }`}
                                >
                                  <span>{v.icon}</span>
                                  <span>{v.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Services Selection */}
                    {step === 3 && (
                      <div className="space-y-5">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif] mb-1">Choose Event Services</h3>
                          <p className="text-xs text-gray-500 font-medium">Select components WeEnYou coordinates on your behalf.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {SERVICES_CATALOG.map((serv) => {
                            const isSelected = selectedServices.includes(serv.key);
                            return (
                              <button
                                key={serv.key}
                                type="button"
                                onClick={() => handleServiceToggle(serv.key)}
                                className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'bg-[#C89B3C]/5 border-[#C89B3C] ring-1 ring-[#C89B3C]'
                                    : 'bg-white border-gray-150 hover:border-gray-200'
                                }`}
                              >
                                <span className="text-2xl mt-0.5 leading-none">{serv.icon}</span>
                                <div className="flex-grow">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900 text-xs">{serv.label}</span>
                                    <span className="text-[9px] font-black text-[#C89B3C] uppercase tracking-widest">{serv.tier}</span>
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-1 font-semibold leading-tight">{serv.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Budget & Dynamic Package Estimator */}
                    {step === 4 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif] mb-1">Set Budget & Estimate Cost</h3>
                          <p className="text-xs text-gray-500 font-medium">Adjust budget levels to compute pricing allocations in real time.</p>
                        </div>

                        {/* Interactive Budget Slider */}
                        <div className="space-y-2.5">
                          <div className="flex justify-between text-xs font-bold text-gray-400">
                            <span>Approx. Budget</span>
                            <span className="text-gray-900 text-sm">₹{(budget/100000).toFixed(1)} Lakhs</span>
                          </div>
                          <input 
                            type="range" 
                            min="100000"
                            max="5000000"
                            step="50000"
                            value={budget}
                            onChange={(e) => setBudget(Number(e.target.value))}
                            className="w-full accent-[#C89B3C] cursor-pointer"
                          />
                        </div>

                        {/* Dynamic Package Bill Breakdown */}
                        <div className="border border-green-200 rounded-3xl bg-green-50/20 p-5 space-y-4">
                          <div className="text-center pb-2 border-b border-gray-100">
                            <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Calculated Estimate</span>
                            <div className="text-2xl font-black text-green-800 mt-1">₹{(estimates.min/100000).toFixed(2)}L – ₹{(estimates.max/100000).toFixed(2)}L</div>
                          </div>

                          <div className="space-y-2 text-xs font-medium text-gray-600">
                            <div className="flex justify-between">
                              <span>Banquet/Resort Venue:</span>
                              <span className="font-bold text-gray-900">₹{(estimates.venue/100000).toFixed(2)}L</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Stage Decoration:</span>
                              <span className="font-bold text-gray-900">₹{(estimates.decor/100000).toFixed(2)}L</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Banqueting & Caterers:</span>
                              <span className="font-bold text-gray-900">₹{(estimates.food/100000).toFixed(2)}L</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Candid Photography:</span>
                              <span className="font-bold text-gray-900">₹{(estimates.photo/100000).toFixed(2)}L</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Preferences, Review & Submission */}
                    {step === 5 && (
                      <div className="space-y-5">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif] mb-1">Contact & Preferences</h3>
                          <p className="text-xs text-gray-500 font-medium">Verify your plan details to assign your WeEnYou Event Planner.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Phone Number</label>
                            <input 
                              type="tel" 
                              required
                              placeholder="e.g. +91 98765 43210"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Preferred Call Time</label>
                            <select
                              value={contactTime}
                              onChange={(e) => setContactTime(e.target.value)}
                              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none cursor-pointer"
                            >
                              <option value="Morning">Morning</option>
                              <option value="Afternoon">Afternoon</option>
                              <option value="Evening">Evening</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Additional Theme Preferences</label>
                          <textarea 
                            rows={3}
                            placeholder="Color choices, special traditional setups, flower preferences..."
                            value={themeNotes}
                            onChange={(e) => setThemeNotes(e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] focus:outline-none resize-none"
                          />
                        </div>

                        {/* Summary review itemization */}
                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-2">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Plan Review</span>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 font-medium">Event:</span>
                            <span className="font-bold text-gray-800">{eventType}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 font-medium">Location:</span>
                            <span className="font-bold text-gray-800">{city}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500 font-medium">Guests Count:</span>
                            <span className="font-bold text-gray-800">{guests} guests</span>
                          </div>
                        </div>

                        {errorMsg && (
                          <div className="text-xs font-bold text-red-500">{errorMsg}</div>
                        )}
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Wizard Action Footer bar */}
              <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="px-6 py-3 border border-gray-200 text-gray-500 hover:text-gray-800 font-bold rounded-full text-xs hover:bg-gray-50 transition-colors disabled:opacity-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeftIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                  Back
                </button>

                {step < 5 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={(step === 1 && !eventType) || (step === 2 && (!city || !date))}
                    className="px-8 py-3 bg-[#C89B3C] hover:bg-[#b58931] text-white font-bold rounded-full text-xs shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    Continue
                    <ChevronRightIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting || !phoneNumber}
                    className="px-10 py-3.5 bg-gradient-to-r from-[#C89B3C] to-[#e0b555] text-white font-bold rounded-full text-xs shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer border border-[#b58931]/15"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span>Submitting Plan...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Details</span>
                        <CheckIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>

          </div>
        )}

      </section>

      {/* Your Dedicated Event Concierge Section */}
      <section className="py-24 bg-[#FAFAFA] border-t border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-center gap-12 text-left">
          {/* Left info column */}
          <div className="flex-1 space-y-6">
            <div className="text-xs font-black text-[#C89B3C] uppercase tracking-wider">Your Concierge</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
              Your Dedicated Event Concierge
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              A dedicated event specialist will guide you through venue selection, vendor coordination, budgeting, timelines, and execution.
            </p>

            {/* Timeline nodes */}
            <div className="space-y-4 pt-2">
              {[
                { title: 'Introductory Call', desc: 'Schedule a brief call to align on your vision, requirements, and themes.', icon: '📞' },
                { title: 'Personalized Recommendations', desc: 'Receive curated lists of verified banquet halls and packages matching your budget.', icon: '📋' },
                { title: 'Confirmation Booking', desc: 'Confirm final dates with direct partner terms and secure platform booking.', icon: '🏛️' },
                { title: 'Milestone Event Day', desc: 'Relax as your manager oversees coordinators and service operators on-site.', icon: '🎉' }
              ].map((node, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-white border border-gray-150 flex items-center justify-center text-sm shadow-sm shrink-0">
                    {node.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-xs leading-none mb-1">{node.title}</h4>
                    <p className="text-gray-400 text-[10px] font-semibold">{node.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right graphics backdrop card */}
          <div className="w-full max-w-sm md:w-[360px] h-[400px] rounded-[32px] overflow-hidden shadow-xl border border-gray-100 shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=500&q=80" 
              alt="Dedicated Planner" 
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Why WeEnYou Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 border-b border-gray-100">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="text-xs font-black text-[#C89B3C] uppercase tracking-wider mb-2">Our Quality</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Why hosts prefer WeEnYou
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2">
            Every feature we construct is built to protect the host's peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {WHY_WEENYOU.map((val, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_45px_rgba(200,155,60,0.04)] hover:border-[#C89B3C]/25 transition-all duration-300 text-left space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 text-base flex items-center justify-center">
                {val.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-base font-['Plus_Jakarta_Sans',sans-serif]">{val.title}</h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 max-w-4xl mx-auto px-6 sm:px-8 border-b border-gray-100">
        <div className="text-center mb-16">
          <div className="text-xs font-black text-[#C89B3C] uppercase tracking-wider mb-2">Common Questions</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={idx} 
                className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm text-left"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(prev => prev === idx ? null : idx)}
                  className="w-full px-6 py-4.5 flex items-center justify-between font-bold text-sm text-gray-800 hover:bg-gray-50/50 transition-colors"
                >
                  <span className="leading-snug pr-4">{faq.q}</span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 text-center">
        <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-r from-gray-900 to-black text-white py-16 px-8 sm:px-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C89B3C]/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Ready to Start Planning?
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto font-medium">
              We'll help you create unforgettable memories while taking care of every detail.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={startPlanning}
                className="flex-1 py-4 bg-gradient-to-r from-[#C89B3C] to-[#e0b555] text-white font-bold text-[15px] rounded-full shadow-[0_8px_30px_rgba(200,155,60,0.3)] hover:shadow-[0_12px_35px_rgba(200,155,60,0.5)] transition-all cursor-pointer border border-[#b58931]/30"
              >
                Start Planning
              </button>
              <button
                onClick={() => alert('Connecting with our planner support line. Live expert support coming soon!')}
                className="flex-1 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-[15px] rounded-full border border-white/20 transition-all cursor-pointer"
              >
                Talk to an Expert
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}