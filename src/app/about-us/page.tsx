'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  HandRaisedIcon,
  LightBulbIcon,
  UserGroupIcon,
  SparklesIcon,
  GlobeAsiaAustraliaIcon,
  BuildingOffice2Icon,
  UsersIcon,
  CurrencyRupeeIcon,
  EnvelopeOpenIcon,
  ClipboardDocumentCheckIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const VALUES = [
  {
    title: 'Transparency',
    desc: 'No hidden pricing, direct contact details, and open communication channels between hosts, venues, and vendors.',
    icon: ShieldCheckIcon
  },
  {
    title: 'Trust',
    desc: 'We verify every listing and partner on our platform to ensure your milestones are celebrated with complete confidence.',
    icon: HandRaisedIcon
  },
  {
    title: 'Innovation',
    desc: 'Leveraging smart tools like digital customize-and-share invites, budget estimators, and vendor managers to keep you ahead.',
    icon: LightBulbIcon
  },
  {
    title: 'Customer First',
    desc: 'Your peace of mind is our success. We align every decision and design around making your host duties completely stress-free.',
    icon: UserGroupIcon
  },
  {
    title: 'Quality',
    desc: 'Only the best venues, caterers, and decorators make it onto WeEnYou, maintaining high standards for every size of event.',
    icon: SparklesIcon
  },
  {
    title: 'Community',
    desc: 'Building a collaborative ecosystem of event professionals, banquet hall operators, and hosts across India.',
    icon: GlobeAsiaAustraliaIcon
  }
];

const WHY_US_FEATURES = [
  {
    title: 'Curated Venues',
    desc: 'Browse premium banquet halls, green lawns, and heritage resorts vetted for hygiene, service, and infrastructure.',
    icon: BuildingOffice2Icon
  },
  {
    title: 'Trusted Vendors',
    desc: 'Directly connect with certified makeup artists, photograpers, high-end decorators, and skilled caterers near you.',
    icon: UsersIcon
  },
  {
    title: 'Transparent Pricing',
    desc: 'Real estimate calculators and package breakdowns to plan your celebrations without budget surprises.',
    icon: CurrencyRupeeIcon
  },
  {
    title: 'Digital Invitations',
    desc: 'Create beautiful digital cards and flyers. Customize text, fonts, colors, and share live RSVP links on WhatsApp.',
    icon: EnvelopeOpenIcon
  },
  {
    title: 'Easy Planning',
    desc: 'Keep track of checklist items, menu plans, booking payments, and coordinators in a single unified dashboard.',
    icon: ClipboardDocumentCheckIcon
  },
  {
    title: 'Dedicated Support',
    desc: 'Get personal event coordinators who act as your co-pilots during final deal negotiations and on-site coordination.',
    icon: ChatBubbleLeftRightIcon
  }
];

const TIMELINE_STEPS = [
  { year: '2025', title: 'WeEnYou Was Born', desc: 'Conceived out of a personal struggle to plan family events, starting with the goal of solving venue discovery in India.' },
  { year: 'Phase 2', title: 'Research & Validation', desc: 'Interviewed hundreds of banquet halls, couples, and event managers across India to study pain points and design a seamless solution.' },
  { year: 'Phase 3', title: 'Platform Development', desc: 'Built the core WeEnYou engine, featuring real-time availability checks, transparent pricing estimators, and digital invites customizers.' },
  { year: 'Phase 4', title: 'Venue Onboarding', desc: 'Onboarded early verified venue partners across key metropolitan regions, validating safety and quality protocols.' },
  { year: 'Phase 5', title: 'Public Launch', desc: 'Launched the WeEnYou web app, enabling users to browse, customize invitations, estimate budgets, and connect with experts.' },
  { year: 'Phase 6', title: 'Expanding Across India', desc: 'Scaling operations to bring unified booking workflows to Tier-2 and Tier-3 cities, partnering with local planners.' },
  { year: 'Future', title: 'India\'s Leading Event Platform', desc: 'To become the single operational dashboard for every family and corporate event, setting the benchmark for celebration booking.' }
];

export default function AboutUsPage() {
  const shouldReduceMotion = useReducedMotion();

  // Entrance animations config
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 220,
        delay: custom * 0.1,
      }
    })
  };

  return (
    <div className="bg-[#FCFCFC] min-h-screen text-[#111827] font-sans pb-12 selection:bg-[#C89B3C]/20 overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative w-full min-h-[500px] flex items-center justify-center py-20 px-6 overflow-hidden">
        {/* Background Image with Gold Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80" 
            alt="Milestone Event Backdrop" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/75 to-[#C89B3C]/30 z-10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-4xl text-center text-white space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-[#C89B3C]/20 border border-[#C89B3C]/35 px-4.5 py-1.5 rounded-full text-[#C89B3C] text-xs font-bold uppercase tracking-widest shadow-sm"
          >
            <span>✨</span> Our Story
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight font-['Plus_Jakarta_Sans',sans-serif]"
          >
            We Enable You to Celebrate.
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-lg sm:text-xl font-bold text-[#C89B3C] tracking-wide"
          >
            Every celebration deserves the perfect beginning.
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-medium"
          >
            Whether it's a wedding, birthday, anniversary, engagement, baby shower, corporate event, or any special occasion, WeEnYou helps you discover venues, connect with trusted vendors, and plan unforgettable experiences—all in one place.
          </motion.p>
        </div>
      </section>

      {/* Our Story Narrative Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left: Narrative Text */}
          <div className="flex-1 text-left space-y-6">
            <div className="text-xs font-black text-[#C89B3C] uppercase tracking-wider">The Motivation</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
              Why We Started WeEnYou
            </h2>
            <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed font-medium">
              <p>
                Planning an event in India is traditionally a labor of love—but it has also become a source of immense stress. What should be a time of celebration and family bonding often starts with weeks of visiting scattered halls, making endless phone calls, and dealing with inconsistent pricing quotes.
              </p>
              <p>
                We saw families spending countless hours juggling venue bookings, photographers, and caterers separately, never fully certain about availability or quality. The lack of transparency in pricing and vendor verification created unnecessary anxiety for hosts.
              </p>
              <p>
                We believed there had to be a better way. Celebration hosts deserve to focus on creating memories, not managing logistics spreadsheets. That's why WeEnYou was born—to bring trusted venues, verified vendor profiles, and smart digital invites together on a single, elegant platform. We streamline discovery, eliminate hidden fees, and hand you back control over your timelines.
              </p>
            </div>
          </div>

          {/* Right: Graphic / Event decor portrait */}
          <div className="flex-grow w-full max-w-lg lg:max-w-xl h-[420px] rounded-[32px] overflow-hidden shadow-xl border border-gray-100 relative group flex-shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80" 
              alt="Luxury flower decor wedding table" 
              className="object-cover w-full h-full group-hover:scale-103 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>

        </div>
      </section>

      {/* Meet the Founder Section */}
      <section className="py-20 bg-gray-50/30 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-8">
          
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
              MEET THE FOUNDER
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
              A Message from the Founder
            </h2>
          </div>

          {/* Letter content in elegant serif */}
          <div className="text-left font-serif text-[15px] sm:text-[17px] text-gray-700 leading-relaxed space-y-5 border-l-2 border-[#C89B3C]/30 pl-6 py-1">
            <p>
              I started WeEnYou with one simple belief—planning a celebration should feel just as joyful as the celebration itself.
            </p>
            <p>
              I saw families spending countless hours searching for venues, comparing prices, coordinating with vendors, and managing everything separately. What should have been an exciting journey often became stressful.
            </p>
            <p>
              That inspired me to create WeEnYou—a platform that simplifies every step of event planning by bringing trusted venues, verified vendors, and planning tools together in one place.
            </p>
            <p>
              Our mission is simple: <strong>We Enable You to Celebrate.</strong> Thank you for being part of this journey.
            </p>
          </div>

          {/* Clean Understated Closing in modern sans-serif */}
          <div className="pt-4 text-left pl-7 space-y-3 font-sans">
            <div className="text-xs text-gray-400 font-medium">Warm regards,</div>
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-[#C89B3C]">Sohel Akhtar</div>
              <div className="text-[11px] text-gray-500 font-bold">Founder & CEO, WeEnYou</div>
            </div>

            {/* LinkedIn Profile */}
            <div className="pt-2">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex w-8 h-8 rounded-full bg-white border border-gray-200 shadow-xs items-center justify-center hover:border-blue-500/50 hover:text-blue-600 transition-colors text-gray-500 cursor-pointer"
                aria-label="Sohel Akhtar LinkedIn Profile"
              >
                <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Mission & Vision double columns */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Mission Card */}
          <div className="bg-[#C89B3C]/5 border border-[#C89B3C]/10 rounded-[32px] p-8 sm:p-12 text-left space-y-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#C89B3C] shadow-sm text-xl border border-[#C89B3C]/10">
              🎯
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">Our Mission</h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium">
              To empower individuals, families, and businesses by making event planning simple, transparent, and enjoyable through technology and trusted partnerships.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-[#C89B3C]/5 border border-[#C89B3C]/10 rounded-[32px] p-8 sm:p-12 text-left space-y-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#C89B3C] shadow-sm text-xl border border-[#C89B3C]/10">
              👁️
            </div>
            <h3 className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">Our Vision</h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-medium">
              To become India's most trusted event planning ecosystem where every celebration begins with confidence and every memorable moment starts with WeEnYou.
            </p>
          </div>

        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 border-b border-gray-100">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="text-xs font-black text-[#C89B3C] uppercase tracking-wider mb-2">Our Beliefs</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Our Core Values
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2">
            These values guide our design updates, service partnerships, and booking tools every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {VALUES.map((val, idx) => {
            const Icon = val.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                custom={idx}
                whileHover={shouldReduceMotion ? {} : { y: -6 }}
                className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_45px_rgba(200,155,60,0.04)] hover:border-[#C89B3C]/25 transition-all duration-300 text-left space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 text-[#C89B3C] flex items-center justify-center">
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-bold text-gray-900 text-base font-['Plus_Jakarta_Sans',sans-serif]">{val.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{val.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Our Journey timeline */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 border-b border-gray-100">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="text-xs font-black text-[#C89B3C] uppercase tracking-wider mb-2">Our Road</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
            The Journey of WeEnYou
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2">
            From an initial spark of frustration to a country-wide event coordination ecosystem.
          </p>
        </div>

        {/* Timeline Path */}
        <div className="relative max-w-3xl mx-auto pl-8 sm:pl-0">
          
          {/* Vertical connecting line */}
          <div className="absolute top-2 bottom-2 left-3 sm:left-1/2 w-0.5 bg-gray-100 -translate-x-1/2 z-0"></div>

          <div className="space-y-12 relative z-10">
            {TIMELINE_STEPS.map((step, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div 
                  key={idx}
                  className={`flex flex-col sm:flex-row items-start sm:items-center w-full ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  }`}
                >
                  {/* Text Column */}
                  <div className="w-full sm:w-1/2 text-left sm:text-right sm:px-8 even:sm:text-left">
                    <div className={`bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow ${
                      isEven ? 'sm:text-left' : 'sm:text-right'
                    }`}>
                      <span className="inline-block bg-[#C89B3C]/10 border border-[#C89B3C]/20 px-3 py-1 rounded-full text-[#C89B3C] text-[10px] font-black tracking-widest uppercase mb-2">
                        {step.year}
                      </span>
                      <h4 className="font-bold text-gray-900 text-base mb-1 font-['Plus_Jakarta_Sans',sans-serif]">{step.title}</h4>
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Bullet Node */}
                  <div className="absolute left-3 sm:left-1/2 w-6 h-6 rounded-full bg-white border-4 border-[#C89B3C] shadow-md -translate-x-1/2 z-20 shrink-0"></div>

                  {/* Empty Spacer Column for Desktop grid */}
                  <div className="hidden sm:block w-1/2"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why People Choose WeEnYou Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 border-b border-gray-100">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="text-xs font-black text-[#C89B3C] uppercase tracking-wider mb-2">Platform Features</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Why People Choose WeEnYou
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2">
            Every feature we construct is built to protect the host's peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {WHY_US_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                custom={idx}
                whileHover={shouldReduceMotion ? {} : { y: -6 }}
                className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_45px_rgba(200,155,60,0.04)] hover:border-[#C89B3C]/25 transition-all duration-300 text-left space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 text-[#C89B3C] flex items-center justify-center">
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-bold text-gray-900 text-base font-['Plus_Jakarta_Sans',sans-serif]">{feat.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Our Promise full-width banner */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-black text-white relative overflow-hidden">
        {/* Soft background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C89B3C]/10 rounded-full blur-3xl z-0"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl z-0"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="text-[10px] font-black text-[#C89B3C] uppercase tracking-widest">Our Promise</div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            We Don't Just Help You Plan Events.<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#C89B3C] to-[#e0b555] bg-clip-text text-transparent">We Enable You to Celebrate.</span>
          </h2>
          
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
            Every feature we build is designed to remove stress from event planning so you can focus on creating memories with the people who matter most.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 text-center space-y-8">
        <div className="space-y-3">
          <div className="text-xs font-black text-[#C89B3C] uppercase tracking-wider">Start Planning</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 font-['Plus_Jakarta_Sans',sans-serif]">
            Let's Create Something Memorable Together.
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-xl mx-auto pt-2">
          <Link 
            href="/" 
            className="flex-1 py-4 bg-gradient-to-r from-[#C89B3C] to-[#e0b555] text-white font-bold text-[15px] rounded-full shadow-[0_8px_30px_rgba(200,155,60,0.25)] hover:shadow-[0_12px_35px_rgba(200,155,60,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all text-center border border-[#b58931]/30 cursor-pointer"
          >
            Explore Venues
          </Link>
          <Link 
            href="/become-a-partner" 
            className="flex-1 py-4 bg-white text-gray-800 font-bold text-[15px] rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all border border-gray-200 text-center cursor-pointer"
          >
            Become a Partner
          </Link>
          <Link 
            href="/help" 
            className="flex-1 py-4 bg-gray-900 hover:bg-black text-white font-bold text-[15px] rounded-full shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all text-center cursor-pointer"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Footer Quote Signature Block */}
      <section className="py-16 bg-gray-50/50 border-t border-gray-100 text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <blockquote className="text-lg sm:text-xl font-serif text-gray-700 italic">
            “Every unforgettable celebration begins with a single decision. We're honored to be part of yours.”
          </blockquote>
          
          <div className="space-y-1">
            <div className="text-gray-900 font-black text-sm uppercase tracking-widest">Sohel Akhtar</div>
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Founder & CEO, WeEnYou</div>
          </div>
          
          <div className="text-[#C89B3C] text-xs font-black tracking-widest uppercase pt-2">
            We Enable You to Celebrate.
          </div>
        </div>
      </section>

    </div>
  );
}