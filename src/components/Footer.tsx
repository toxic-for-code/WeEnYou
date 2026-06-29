"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  ArrowUpIcon, 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

const FEEDBACK_TYPES = [
  { key: 'Suggestion', label: '💡 Suggestion' },
  { key: 'Bug', label: '🐞 Report a Bug' },
  { key: 'Feature', label: '✨ Feature Request' },
  { key: 'Compliment', label: '❤️ Compliment' },
  { key: 'General', label: '⚡ General Feedback' }
];

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent'
};

export default function Footer() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Scroll listener state for Back to Top
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Active Scroll Fading State
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard Focus / Input Focus Hiding State
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Expert panel drawer visibility
  const [isExpertOpen, setIsExpertOpen] = useState(false);

  // Global Feedback Modal State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Form State for Feedback
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState('Suggestion');
  const [formFeedback, setFormFeedback] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Tooltip hover state for Ask an Expert
  const [hoverExpert, setHoverExpert] = useState(false);

  // Handle window scroll to toggle Back to Top visibility and Active scrolling fade
  useEffect(() => {
    const handleScroll = () => {
      // 1. Back to top visibility
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }

      // 2. Active scroll fade opacity
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Keyboard opening / form field focus listener
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const tagName = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      setIsKeyboardOpen(false);
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Prevent background scroll when modal or bottom sheet is open
  useEffect(() => {
    if (isFeedbackOpen || isExpertOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFeedbackOpen, isExpertOpen]);

  // Do not render footer on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleResetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormRating(5);
    setFormHoverRating(null);
    setFeedbackType('Suggestion');
    setFormFeedback('');
    setContactConsent(false);
    setFormSubmitted(false);
    setIsSubmitting(false);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFeedback) return;

    setIsSubmitting(true);
    
    // Simulate API call loading state for 1 second
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);

      // Trigger confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#C89B3C', '#E5C07B', '#A3702C', '#F1C40F', '#111111']
      });
    }, 1000);
  };

  // Check if current page is a booking page to add extra bottom padding for the sticky bar
  const isBookingPage = pathname?.includes('/book');

  const ratingValue = formHoverRating ?? formRating;
  const ratingLabelText = RATING_LABELS[ratingValue] || '';

  return (
    <footer className={`w-full bg-[#111111] text-[#cccccc] pt-[60px] relative ${isBookingPage ? 'pb-[180px] md:pb-[40px]' : 'pb-[40px]'}`}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Mobile: Full width Logo & Tagline */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-12">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/logo.png"
              alt="WeEnYou Logo"
              width={160}
              height={48}
              className="object-contain"
              style={{ filter: 'brightness(0) invert(1)' }} /* Makes the logo white */
            />
          </Link>
          <p className="text-[#cccccc] text-base max-w-sm">
            Making every event memorable. Your trusted event partner.
          </p>
        </div>

        {/* Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-[40px] gap-y-10 lg:gap-y-[16px] mb-12 text-center lg:text-left">
          
          {/* Product */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg mb-2">Product</h3>
            <Link href="/vendors" className="hover:text-[#C89B3C] transition-colors">Find Vendors</Link>
            <Link href="/e-invites" className="hover:text-[#C89B3C] transition-colors">Send E-Invites</Link>
            <Link href="/ideas-tips" className="hover:text-[#C89B3C] transition-colors">Ideas & Tips</Link>
            <Link href="/plan-event" className="hover:text-[#C89B3C] transition-colors">Plan Your Event</Link>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg mb-2">Company</h3>
            <Link href="/about-us" className="hover:text-[#C89B3C] transition-colors">About Us</Link>
            <Link href="/become-a-partner" className="hover:text-[#C89B3C] transition-colors">Become a Partner</Link>
            <Link href="/owner-auth" className="hover:text-[#C89B3C] transition-colors">List Your Hall</Link>
            <Link href="/help" className="hover:text-[#C89B3C] transition-colors">Contact Us</Link>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg mb-2">Resources</h3>
            <Link href="/blog" className="hover:text-[#C89B3C] transition-colors">Blog</Link>
            <Link href="/help" className="hover:text-[#C89B3C] transition-colors">Help Center</Link>
            <Link href="#" className="hover:text-[#C89B3C] transition-colors">Community</Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg mb-2">Legal</h3>
            <Link href="/privacy" className="hover:text-[#C89B3C] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#C89B3C] transition-colors">Terms of Service</Link>
            <Link href="/cookie-policy" className="hover:text-[#C89B3C] transition-colors">Cookie Policy</Link>
            <Link href="/refund-policy" className="hover:text-[#C89B3C] transition-colors">Refund & Cancellation Policy</Link>
          </div>
        </div>

        {/* Follow Us / Social Media */}
        <div className="flex flex-col items-center mb-10">
          <h3 className="text-white font-bold text-lg mb-6">Follow Us</h3>
          <div className="flex items-center justify-center gap-[40px]">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[#cccccc] hover:text-[#C89B3C] transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[#cccccc] hover:text-[#C89B3C] transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-[#cccccc] hover:text-[#C89B3C] transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-[#cccccc] hover:text-[#C89B3C] transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 11-2 2 2 2 0 012-2z"></path></svg>
            </a>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="pt-6 border-t border-white/10 flex flex-col items-center">
          <span className="text-sm text-[#cccccc] text-center">&copy; {new Date().getFullYear()} WeEnYou. All rights reserved.</span>
        </div>
      </div>

      {/* Floating Actions System Container */}
      <AnimatePresence>
        {!isKeyboardOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isScrolling ? 0.4 : 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
            className="fixed z-[2000] flex flex-col-reverse items-center gap-3 sm:gap-4 transition-opacity duration-300"
            style={{
              bottom: 'max(20px, env(safe-area-inset-bottom))',
              right: '16px',
              pointerEvents: 'auto',
              // Desktop override margins
              marginRight: 'calc(env(safe-area-inset-right) + 8px)'
            }}
          >
            {/* 1. Back to Top Button (circular, gold, 56x56) */}
            <AnimatePresence>
              {showBackToTop && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', damping: 20 }}
                  onClick={scrollToTop}
                  className="w-14 h-14 bg-[#C89B3C] hover:bg-[#b58931] text-white rounded-full shadow-[0_6px_20px_rgba(200,155,60,0.3)] transition-colors flex items-center justify-center cursor-pointer pointer-events-auto active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50"
                  aria-label="Back to top"
                >
                  <ArrowUpIcon className="w-5 h-5 stroke-[2.5]" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* 2. Ask an Expert Button (circular, blue, 56x56) */}
            <div className="relative pointer-events-auto">
              
              {/* Desktop Tooltip */}
              <AnimatePresence>
                {hoverExpert && !isExpertOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="hidden lg:block absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md pointer-events-none"
                  >
                    Ask an Expert
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Icon Button */}
              <button
                onClick={() => setIsExpertOpen(true)}
                onMouseEnter={() => setHoverExpert(true)}
                onMouseLeave={() => setHoverExpert(false)}
                className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-[0_6px_20px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label="Ask an event planning expert"
              >
                <ChatBubbleLeftRightIcon className="w-6 h-6 stroke-[2.2]" />
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Ask an Expert Slide-Up Bottom Sheet Panel (Mobile) & Slide Panel (Desktop) */}
      <AnimatePresence>
        {isExpertOpen && (
          <div className="fixed inset-0 z-[5000] flex items-end sm:items-center justify-center p-0 sm:p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpertOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Bottom Sheet Card */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { y: '100%' }}
              animate={shouldReduceMotion ? { opacity: 1 } : { y: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="relative w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl p-6 sm:p-8 text-left z-10 border-t sm:border border-gray-100 flex flex-col gap-5"
              style={{
                // Respect iOS bottom safe area inside bottom sheet
                paddingBottom: 'calc(max(24px, env(safe-area-inset-bottom)) + 8px)'
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Ask an Event Expert
                  </h3>
                  <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                    Need help planning your event? Our team of event coordinates and banquet experts is here to guide you.
                  </p>
                </div>
                <button
                  onClick={() => setIsExpertOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all cursor-pointer"
                  aria-label="Close panel"
                >
                  <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Secondary Options */}
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsExpertOpen(false);
                    setIsFeedbackOpen(true);
                  }}
                  className="w-full text-left px-4.5 py-3.5 bg-gray-50 border border-gray-100 hover:border-[#C89B3C]/50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-800 flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-[#C89B3C]" />
                  Give Platform Feedback
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3.5 mt-2">
                <button
                  onClick={() => {
                    setIsExpertOpen(false);
                    alert('Connecting to an expert... Live chat coming soon!');
                  }}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer text-center text-sm"
                >
                  Start Chat
                </button>
                <button
                  onClick={() => setIsExpertOpen(false)}
                  className="w-full py-3.5 border border-gray-200 text-gray-500 hover:text-gray-800 rounded-full font-bold transition-all cursor-pointer text-center text-xs"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Interactive Feedback Form Modal */}
      <AnimatePresence>
        {isFeedbackOpen && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFeedbackOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-[550px] bg-white rounded-[28px] shadow-2xl overflow-hidden border border-gray-100 z-10 flex flex-col max-h-[90vh]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="global-modal-title"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer z-20"
                aria-label="Close feedback modal"
              >
                <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto p-8 sm:p-10 space-y-6 text-left">
                {!formSubmitted ? (
                  <form onSubmit={handleSubmitFeedback} className="space-y-6">
                    
                    {/* Header */}
                    <div>
                      <h3 id="global-modal-title" className="text-2xl sm:text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif] mb-2">
                        Share Your Feedback
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        We're always improving WeEnYou. Tell us about your experience, share suggestions, or report anything we can make better.
                      </p>
                    </div>

                    {/* Experience Rating */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Overall Experience
                      </label>
                      <div className="flex gap-2 items-center">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setFormHoverRating(star)}
                              onMouseLeave={() => setFormHoverRating(null)}
                              onClick={() => setFormRating(star)}
                              className="text-gray-300 hover:scale-110 active:scale-95 transition-all focus:outline-none cursor-pointer"
                              aria-label={`Rate ${star} stars - ${RATING_LABELS[star]}`}
                            >
                              <StarIcon 
                                className={`w-8 h-8 transition-colors ${
                                  star <= ratingValue
                                    ? 'text-[#C89B3C] drop-shadow-[0_0_2px_rgba(200,155,60,0.2)]'
                                    : 'text-gray-200'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-sm font-bold text-[#C89B3C] ml-2 tracking-wide transition-all uppercase">
                          {ratingLabelText}
                        </span>
                      </div>
                    </div>

                    {/* Feedback Type Selection */}
                    <div className="space-y-2.5">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Feedback Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {FEEDBACK_TYPES.map((type) => {
                          const isSelected = feedbackType === type.key;
                          return (
                            <button
                              key={type.key}
                              type="button"
                              onClick={() => setFeedbackType(type.key)}
                              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border flex-shrink-0 cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#C89B3C]/10 text-[#C89B3C] border-[#C89B3C] shadow-sm'
                                  : 'bg-white text-gray-600 border-gray-200/80 hover:bg-gray-50'
                              }`}
                            >
                              {type.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                      <label htmlFor="global-feedback-name" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Your Name
                      </label>
                      <input
                        id="global-feedback-name"
                        type="text"
                        placeholder="e.g. Aarav"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] text-gray-800 text-sm font-medium transition-all shadow-inner focus:outline-none"
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <label htmlFor="global-feedback-email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Email Address (Optional)
                      </label>
                      <input
                        id="global-feedback-email"
                        type="email"
                        placeholder="name@example.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] text-gray-800 text-sm font-medium transition-all shadow-inner focus:outline-none"
                      />
                    </div>

                    {/* Message Input with Character Counter */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label htmlFor="global-feedback-msg" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Feedback / suggestions
                        </label>
                        <span className={`text-[10px] font-bold ${formFeedback.length > 900 ? 'text-red-500' : 'text-gray-400'}`}>
                          {formFeedback.length} / 1000
                        </span>
                      </div>
                      <textarea
                        id="global-feedback-msg"
                        rows={4}
                        required
                        maxLength={1000}
                        placeholder="Tell us about your experience with WeEnYou. We'd love to hear your ideas, suggestions, or anything that could make your experience even better."
                        value={formFeedback}
                        onChange={(e) => setFormFeedback(e.target.value)}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] text-gray-800 text-sm font-medium transition-all shadow-inner focus:outline-none resize-none min-h-[110px]"
                      />
                    </div>

                    {/* Contact Consent Checkbox */}
                    <div className="flex items-start gap-3 py-1">
                      <input
                        id="global-contact-consent"
                        type="checkbox"
                        checked={contactConsent}
                        onChange={(e) => setContactConsent(e.target.checked)}
                        className="mt-1 h-4.5 w-4.5 rounded border-gray-300 text-[#C89B3C] focus:ring-[#C89B3C] cursor-pointer"
                      />
                      <label htmlFor="global-contact-consent" className="text-xs text-gray-500 font-semibold cursor-pointer select-none">
                        I'd like to be contacted regarding my feedback.
                      </label>
                    </div>

                    {/* Sticky-like submit wrapper */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-[#C89B3C] to-[#e0b555] text-white font-bold tracking-wide rounded-full shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 border border-[#b58931]/30 cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <span>Share Feedback</span>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center space-y-6"
                  >
                    {/* Success Checkmark Circle */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.15, duration: 0.5 }}
                      className="w-20 h-20 bg-green-50 border border-green-150 rounded-full flex items-center justify-center text-green-500 shadow-inner"
                    >
                      <svg className="w-10 h-10 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </motion.div>

                    <div className="space-y-2">
                      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
                        Thank You!
                      </h3>
                      <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                        Your feedback helps us improve WeEnYou for everyone.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full pt-4 max-w-md mx-auto">
                      <button
                        onClick={() => setIsFeedbackOpen(false)}
                        className="flex-1 py-3.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow transition-all cursor-pointer border border-transparent"
                      >
                        Done
                      </button>
                      <button
                        onClick={handleResetForm}
                        className="flex-1 py-3.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl shadow-sm border border-gray-200 transition-all cursor-pointer"
                      >
                        Share More Feedback
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </footer>
  );
}