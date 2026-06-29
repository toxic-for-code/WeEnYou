'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import confetti from 'canvas-confetti';

interface FeedbackCard {
  id: number;
  name: string;
  city: string;
  feedback: string;
  initial: string;
  gradient: string;
}

const CARDS: FeedbackCard[] = [
  {
    id: 1,
    name: "Aarav",
    city: "Bengaluru",
    feedback: "I usually spend days calling different venues. Having everything in one place would save so much time.",
    initial: "A",
    gradient: "from-[#C89B3C] to-[#E5A93C]"
  },
  {
    id: 2,
    name: "Priya",
    city: "Mumbai",
    feedback: "I love that I can compare venues, pricing and amenities without opening dozens of tabs.",
    initial: "P",
    gradient: "from-[#D48C6F] to-[#C89B3C]"
  },
  {
    id: 3,
    name: "Riya",
    city: "Kolkata",
    feedback: "If this launches with verified venues and transparent pricing, I'd definitely use it for family events.",
    initial: "R",
    gradient: "from-[#C89B3C] to-[#D9C385]"
  },
  {
    id: 4,
    name: "Rahul",
    city: "Hyderabad",
    feedback: "The interface feels clean and easy to understand. Booking venues should be this simple.",
    initial: "R",
    gradient: "from-[#A3702C] to-[#C89B3C]"
  },
  {
    id: 5,
    name: "Sneha",
    city: "Chennai",
    feedback: "I like that I can discover venues based on my budget instead of contacting each one separately.",
    initial: "S",
    gradient: "from-[#E59866] to-[#C89B3C]"
  },
  {
    id: 6,
    name: "Karan",
    city: "Pune",
    feedback: "This could become the Airbnb for event venues if enough halls join.",
    initial: "K",
    gradient: "from-[#5D6D7E] to-[#C89B3C]"
  }
];

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

// Triplicating array for infinite looping
const EXTENDED_CARDS = [...CARDS, ...CARDS, ...CARDS];
const TOTAL_ORIGINAL = CARDS.length;
const START_INDEX = TOTAL_ORIGINAL;

export default function EarlyUserFeedback() {
  const [currentIndex, setCurrentIndex] = useState(START_INDEX);
  const [isResetting, setIsResetting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formHoverRating, setFormHoverRating] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState('Suggestion');
  const [formFeedback, setFormFeedback] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const autoSlideRef = useRef<NodeJS.Timeout | null>(null);
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Handle responsive visible cards count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(3);
      } else if (window.innerWidth >= 768) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = useCallback(() => {
    if (isResetting) return;
    setCurrentIndex((prev) => prev + 1);
  }, [isResetting]);

  const handlePrev = useCallback(() => {
    if (isResetting) return;
    setCurrentIndex((prev) => prev - 1);
  }, [isResetting]);

  // Setup auto slide every 5 seconds
  const startAutoSlide = useCallback(() => {
    stopAutoSlide();
    autoSlideRef.current = setInterval(() => {
      handleNext();
    }, 5000);
  }, [handleNext]);

  const stopAutoSlide = useCallback(() => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
      autoSlideRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [startAutoSlide, stopAutoSlide]);

  const handleAnimationComplete = () => {
    if (currentIndex >= TOTAL_ORIGINAL * 2) {
      setIsResetting(true);
      setCurrentIndex(currentIndex - TOTAL_ORIGINAL);
    }
    else if (currentIndex < TOTAL_ORIGINAL) {
      setIsResetting(true);
      setCurrentIndex(currentIndex + TOTAL_ORIGINAL);
    }
  };

  useEffect(() => {
    if (isResetting) {
      const t = setTimeout(() => {
        setIsResetting(false);
      }, 30);
      return () => clearTimeout(t);
    }
  }, [isResetting]);

  const handleDotClick = (index: number) => {
    if (isResetting) return;
    stopAutoSlide();
    setCurrentIndex(START_INDEX + index);
    startAutoSlide();
  };

  // Keyboard accessibility for Carousel
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      stopAutoSlide();
      handlePrev();
      startAutoSlide();
    } else if (e.key === 'ArrowRight') {
      stopAutoSlide();
      handleNext();
      startAutoSlide();
    }
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const activeDotIndex = ((currentIndex - START_INDEX) % TOTAL_ORIGINAL + TOTAL_ORIGINAL) % TOTAL_ORIGINAL;

  // Animation transition properties
  const animationTransition = isResetting || shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 220, damping: 28 };

  // Reset form helper
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

  // Form Submission
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

  const ratingValue = formHoverRating ?? formRating;
  const ratingLabelText = RATING_LABELS[ratingValue] || '';

  return (
    <section className="py-24 sm:py-32 bg-[#FCFCFC] overflow-hidden select-none border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-[#C89B3C]/10 border border-[#C89B3C]/20 px-4.5 py-1.5 rounded-full text-[#C89B3C] text-sm font-semibold tracking-wide uppercase mb-6"
          >
            <span>✨</span> Early User Feedback
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6 font-['Plus_Jakarta_Sans',sans-serif]"
          >
            People Love the Idea Behind WeEnYou
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-gray-500 text-lg sm:text-xl leading-relaxed"
          >
            Feedback shared by users after exploring the WeEnYou concept and platform experience.
          </motion.p>
        </div>

        {/* Carousel Wrapper */}
        <div 
          className="relative px-1"
          onMouseEnter={stopAutoSlide}
          onMouseLeave={startAutoSlide}
        >
          {/* Navigation Arrows */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-6 z-10">
            <button
              onClick={() => { stopAutoSlide(); handlePrev(); startAutoSlide(); }}
              className="p-3.5 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-gray-400 hover:text-[#C89B3C] hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#C89B3C] border border-gray-100 flex items-center justify-center cursor-pointer"
              aria-label="Previous feedback"
            >
              <ChevronLeftIcon className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-6 z-10">
            <button
              onClick={() => { stopAutoSlide(); handleNext(); startAutoSlide(); }}
              className="p-3.5 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] text-gray-400 hover:text-[#C89B3C] hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#C89B3C] border border-gray-100 flex items-center justify-center cursor-pointer"
              aria-label="Next feedback"
            >
              <ChevronRightIcon className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Cards viewport window */}
          <div 
            ref={carouselContainerRef}
            className="overflow-hidden py-6 -mx-3 px-3 cursor-grab active:cursor-grabbing focus:outline-none"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Early User Feedback Carousel. Use arrow keys to navigate."
          >
            <motion.div
              className="flex"
              animate={{ x: `${-currentIndex * (100 / visibleCount)}%` }}
              transition={animationTransition}
              onAnimationComplete={handleAnimationComplete}
            >
              {EXTENDED_CARDS.map((card, idx) => (
                <div
                  key={`${card.id}-${idx}`}
                  className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-3.5"
                >
                  <motion.div 
                    whileHover={shouldReduceMotion ? {} : { y: -8 }}
                    className="bg-white rounded-[32px] p-8 sm:p-10 border border-gray-100/80 shadow-[0_15px_40px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_50px_rgba(200,155,60,0.05),0_10px_30px_rgba(0,0,0,0.015)] hover:border-[#C89B3C]/35 transition-all duration-400 flex flex-col justify-between h-[360px] md:h-[390px] relative group"
                  >
                    <div>
                      {/* Quote Icon & Gold Stars */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-[#C89B3C] opacity-80 group-hover:opacity-100 group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(200,155,60,0.4)] transition-all duration-300">
                          <svg width="34" height="34" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM3 21V18C3 16.8954 3.89543 16 5 16H8C9.10457 16 10 16.8954 10 18V21C10 22.1046 9.10457 23 8 23H5C3.89543 23 3 22.1046 3 21ZM21.017 11.1377C20.352 11.5343 19.7113 11.7513 19.117 11.8369C18.5226 11.9225 17.9715 11.8841 17.4814 11.7109C16.9913 11.5377 16.5919 11.2335 16.2832 10.7984C15.9745 10.3633 15.8201 9.80371 15.8201 9.11963C15.8201 8.3584 15.9868 7.69727 16.3203 7.13623C16.6538 6.5752 17.1196 6.13086 17.7178 5.80322C18.3159 5.47559 19.0112 5.31177 19.8037 5.31177C20.6553 5.31177 21.3647 5.47559 21.9321 5.80322L20.8926 7.39941C20.5957 7.21484 20.2671 7.12256 19.9067 7.12256C19.5312 7.12256 19.2207 7.21777 18.9751 7.4082C18.7295 7.59863 18.5664 7.84863 18.4858 8.1582C18.4053 8.46777 18.3813 8.78467 18.4141 9.10889C18.4468 9.43311 18.5444 9.69189 18.707 9.88525C18.8696 10.0786 19.1411 10.1753 19.5215 10.1753C19.8818 10.1753 20.2178 10.0889 20.5293 9.91602L21.017 11.1377ZM10.017 11.1377C9.35205 11.5343 8.7113 11.7513 8.11699 11.8369C7.52269 11.9225 6.97151 11.8841 6.48145 11.7109C5.99138 11.5377 5.59194 11.2335 5.2832 10.7984C4.97447 10.3633 4.8201 9.80371 4.8201 9.11963C4.8201 8.3584 4.98683 7.69727 5.32031 7.13623C5.6538 6.5752 6.11961 6.13086 6.71777 5.80322C7.31593 5.47559 8.01123 5.31177 8.80371 5.31177C9.65527 5.31177 10.3646 5.47559 10.9321 5.80322L9.89258 7.39941C9.5957 7.21484 9.26711 7.12256 8.90674 7.12256C8.53125 7.12256 8.2207 7.21777 7.9751 7.4082C7.72949 7.59863 7.56641 7.84863 7.48584 8.1582C7.40527 8.46777 7.3813 8.78467 7.41406 9.10889C7.44682 9.43311 7.54443 9.69189 7.70703 9.88525C7.86963 10.0786 8.14111 10.1753 8.52148 10.1753C8.88184 10.1753 9.21777 10.0889 9.5293 9.91602L10.017 11.1377Z" />
                          </svg>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <StarIcon key={s} className="w-4.5 h-4.5 text-[#C89B3C]" />
                          ))}
                        </div>
                      </div>

                      {/* Feedback Text */}
                      <p className="text-[#2C2C2C] text-[16px] sm:text-[17px] font-medium leading-relaxed tracking-tight mb-8 font-sans">
                        "{card.feedback}"
                      </p>
                    </div>

                    <div>
                      {/* Avatar Details Row */}
                      <div className="flex items-center gap-4 border-t border-gray-50 pt-5">
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white text-sm font-extrabold shadow-sm`}>
                          {card.initial}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm tracking-tight">{card.name}</div>
                          <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{card.city}</div>
                        </div>
                      </div>

                      {/* User Feedback Badge */}
                      <div className="mt-4.5 flex">
                        <span className="inline-flex items-center gap-1.5 bg-[#C89B3C]/8 text-[#C89B3C] border border-[#C89B3C]/15 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
                          <span className="w-1 h-1 rounded-full bg-[#C89B3C]" />
                          User Feedback
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Carousel Navigation Dots */}
        <div className="flex justify-center gap-2.5 mt-8">
          {CARDS.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-[#C89B3C] cursor-pointer ${
                index === activeDotIndex ? 'w-8 bg-[#C89B3C]' : 'w-2 bg-gray-200 hover:bg-gray-300'
              }`}
              aria-label={`Go to feedback slide ${index + 1}`}
              aria-selected={index === activeDotIndex}
              role="tab"
            />
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-20 sm:mt-24 border-t border-gray-100 pt-16 text-center max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-gray-700 font-medium text-lg mb-8 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]"
          >
            Your feedback helps shape the future of WeEnYou.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#C89B3C] to-[#e0b555] text-white font-bold text-[15px] sm:text-[16px] tracking-wide rounded-full shadow-[0_8px_30px_rgba(200,155,60,0.25)] hover:shadow-[0_12px_35px_rgba(200,155,60,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-[#b58931]/30 cursor-pointer"
            >
              Share Your Feedback
            </button>
          </motion.div>
        </div>

      </div>

      {/* Interactive Feedback Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-[600px] bg-white rounded-[28px] shadow-2xl overflow-hidden border border-gray-100 z-10 flex flex-col max-h-[90vh]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer z-20"
                aria-label="Close feedback modal"
              >
                <XMarkIcon className="w-5 h-5 stroke-[2.5]" />
              </button>

              {/* Scrollable Modal Content */}
              <div className="overflow-y-auto p-8 sm:p-10 space-y-6">
                {!formSubmitted ? (
                  <form onSubmit={handleSubmitFeedback} className="space-y-6">
                    
                    {/* Header */}
                    <div>
                      <h3 id="modal-title" className="text-2xl sm:text-3xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif] mb-2">
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
                      <label htmlFor="feedback-name" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Your Name
                      </label>
                      <input
                        id="feedback-name"
                        type="text"
                        placeholder="e.g. Aarav"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#C89B3C] focus:border-[#C89B3C] text-gray-800 text-sm font-medium transition-all shadow-inner focus:outline-none"
                      />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                      <label htmlFor="feedback-email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Email Address (Optional)
                      </label>
                      <input
                        id="feedback-email"
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
                        <label htmlFor="feedback-msg" className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Feedback / suggestions
                        </label>
                        <span className={`text-[10px] font-bold ${formFeedback.length > 900 ? 'text-red-500' : 'text-gray-400'}`}>
                          {formFeedback.length} / 1000
                        </span>
                      </div>
                      <textarea
                        id="feedback-msg"
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
                        id="contact-consent"
                        type="checkbox"
                        checked={contactConsent}
                        onChange={(e) => setContactConsent(e.target.checked)}
                        className="mt-1 h-4.5 w-4.5 rounded border-gray-300 text-[#C89B3C] focus:ring-[#C89B3C] cursor-pointer"
                      />
                      <label htmlFor="contact-consent" className="text-xs text-gray-500 font-semibold cursor-pointer select-none">
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
                        onClick={() => setIsModalOpen(false)}
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
    </section>
  );
}
