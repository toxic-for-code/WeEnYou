'use client';

import React, { useState, Fragment } from 'react';
import { CheckCircleIcon, UserGroupIcon, CalendarIcon, CurrencyRupeeIcon, SparklesIcon, ClipboardDocumentListIcon, ChatBubbleLeftRightIcon, BuildingStorefrontIcon, StarIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useSession, signIn } from 'next-auth/react';
import { useEffect, useRef } from 'react';

const eventTypes = [
  'Wedding', 'Birthday', 'Corporate', 'Engagement', 'Anniversary', 'Other'
];
const venueTypes = [
  'Banquet Hall', 'Lawn', 'Resort', 'Hotel', 'Community Center', 'Other'
];
const services = [
  { label: 'Catering', key: 'catering' },
  { label: 'Decoration', key: 'decoration' },
  { label: 'Music/DJ', key: 'music' },
  { label: 'Photography', key: 'photography' },
  { label: 'Emcee/Anchoring', key: 'emcee' },
  { label: 'Invitation Cards', key: 'invitation' },
  { label: 'Return Gifts', key: 'gifts' },
];

async function fetchEstimate(form) {
  const res = await fetch('/api/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      city: form.city,
      guests: form.guests,
      services: form.services,
    }),
  });
  return res.json();
}

// Helper to fetch assigned manager for the latest event (after submission)
async function fetchAssignedManager(userId) {
  const res = await fetch(`/api/plan-event/assigned-manager?userId=${userId}`);
  return res.json();
}

export default function PlanEventPage() {
  const [form, setForm] = useState({
    eventType: '',
    city: '',
    date: '',
    guests: '',
    budget: '',
    venueType: '',
    services: [],
    theme: '',
    special: '',
    contactTime: '', // new
    eventTag: '',    // new
  });
  const [submitted, setSubmitted] = useState(false);
  const [estimate, setEstimate] = useState({ min: 0, max: 0, breakdown: null });
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [openFaq, setOpenFaq] = useState([false, false]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { data: session, status } = useSession ? useSession() : { data: null, status: 'unauthenticated' };
  const confettiRef = useRef<HTMLDivElement>(null);
  const [assignedManager, setAssignedManager] = useState(null);
  useEffect(() => {
    if (submitted && confettiRef.current) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      });
    }
  }, [submitted]);

  // Real-time estimation effect
  useEffect(() => {
    async function getEstimate() {
      if (form.city && form.guests && form.services.length > 0) {
        const data = await fetchEstimate(form);
        setEstimate({
          min: data.min || 0,
          max: data.max || 0,
          breakdown: data.breakdown || null
        });
      } else {
        setEstimate({ min: 0, max: 0, breakdown: null });
      }
    }
    getEstimate();
  }, [form.city, form.guests, form.services]);

  // After successful submission, fetch assigned manager
  useEffect(() => {
    async function getManager() {
      if (submitted && session?.user?.id) {
        const data = await fetchAssignedManager(session.user.id);
        setAssignedManager(data.manager || null);
      }
    }
    getManager();
  }, [submitted, session]);

  // Simple estimate logic (for demo)
  const calculateEstimate = () => {
    let base = 20000;
    if (form.guests) base += parseInt(form.guests) * 500;
    if (form.services.length) base += form.services.length * 5000;
    return { min: base, max: base + 20000 };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        services: checked
          ? [...prev.services, value]
          : prev.services.filter((s) => s !== value),
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      signIn();
      return;
    }
    console.log('Submitting event with user:', session.user);
    setLoading(true);
    setError('');
    try {
      const submission: any = {
        ...form,
        userId: session.user.id,
        userName: session.user.name,
        userEmail: session.user.email,
      };
      if ((session.user as any)?.phone) submission.userPhone = (session.user as any).phone;
      const res = await fetch('/api/plan-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });
      if (!res.ok) {
        throw new Error('Failed to submit. Please try again.');
      }
      setEstimate(calculateEstimate());
      setSubmitted(true);
      setForm({
        eventType: '',
        city: '',
        date: '',
        guests: '',
        budget: '',
        venueType: '',
        services: [],
        theme: '',
        special: '',
        contactTime: '',
        eventTag: '',
      });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setModalMsg(err.message || 'Something went wrong.');
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModal = (msg) => {
    setModalMsg(msg);
    setShowModal(true);
  };

  const handleFaqToggle = (idx) => {
    setOpenFaq((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  return (
    <div className="min-h-screen w-full py-8 px-2 flex flex-col items-center relative" style={{ background: 'linear-gradient(120deg, #f8f6f1 0%, #f3e9d2 50%, #f7e7ce 100%)' }}>
      {/* 1. Add shimmer overlay to the background (top of the main div) */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-yellow-100/40 to-pink-100/40 animate-shimmer" style={{backgroundSize:'400% 400%', animation:'shimmer 8s ease-in-out infinite'}} />
        <style>{`@keyframes shimmer {0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>
      </div>
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7 }} className="w-full max-w-6xl rounded-2xl shadow-2xl p-8 md:p-12 mb-10 text-center flex flex-col items-center relative overflow-hidden backdrop-blur-[6px] bg-white/70">
        <SparklesIcon className="w-16 h-16 text-pink-300 absolute right-6 top-6 opacity-30 animate-pulse" />
        {session?.user?.name && (
          <div className="text-xl font-semibold text-primary-700 mb-2">Hi, {session.user.name.split(' ')[0]}! Ready to plan your next event?</div>
        )}
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 flex items-center gap-2">🎉 Plan Your Dream Event with WeEnYou</h1>
        <p className="text-lg text-gray-700 mb-4">From booking to decoration, catering to coordination — we’ll handle everything.<br />You enjoy the celebration, we manage the stress.</p>
        <a href="#plan-form" className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-full shadow transition text-lg mt-2 focus:outline-none focus:ring-2 focus:ring-primary-400" aria-label="Jump to event planning form">Get Started — Plan My Event</a>
      </motion.div>

      {/* Event Planner Form */}
      {!submitted && (
        <motion.div id="plan-form" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.1 }} className="w-full max-w-5xl rounded-xl shadow-2xl p-8 mb-10 relative overflow-hidden backdrop-blur-[6px] bg-white/70">
          <ClipboardDocumentListIcon className="w-10 h-10 text-blue-200 absolute right-6 top-6 opacity-30" />
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><UserGroupIcon className="w-7 h-7 text-primary-400" />📝 Tell Us About Your Event</h2>
          <p className="text-gray-600 mb-6 text-base">We’ll plan, manage, and execute your event from start to finish — you just show up and celebrate!</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {loading && (
              <div className="text-center text-primary-600 font-semibold mb-2">Submitting your details...</div>
            )}
            {error && (
              <div className="text-center text-red-600 font-semibold mb-2">{error}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">What type of event?</label>
                <select name="eventType" value={form.eventType} onChange={handleChange} required className="input-field w-full" aria-label="Event type">
                  <option value="">Select event type</option>
                  {eventTypes.map((et) => <option key={et} value={et}>{et}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">City & preferred date</label>
                <input name="city" value={form.city} onChange={handleChange} required placeholder="City" className="input-field w-full mb-2" aria-label="City" />
                <input name="date" type="date" value={form.date} onChange={handleChange} required className="input-field w-full" aria-label="Event date" />
              </div>
              <div>
                <label className="block font-medium mb-1">Guest count</label>
                <input name="guests" type="number" min="1" value={form.guests} onChange={handleChange} required className="input-field w-full" aria-label="Guest count" />
              </div>
              <div>
                <label className="block font-medium mb-1">Budget (₹)</label>
                <input name="budget" type="number" min="0" value={form.budget} onChange={handleChange} required className="input-field w-full" aria-label="Budget" />
              </div>
              <div>
                <label className="block font-medium mb-1">Venue type preference</label>
                <select name="venueType" value={form.venueType} onChange={handleChange} required className="input-field w-full">
                  <option value="">Select venue type</option>
                  {venueTypes.map((vt) => <option key={vt} value={vt}>{vt}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Event Name or Tag <span className="text-gray-400 font-normal">(optional)</span></label>
                <input name="eventTag" value={form.eventTag} onChange={handleChange} placeholder="E.g., My Sister’s Wedding or Company Annual Day" className="input-field w-full" aria-label="Event name or tag" />
              </div>
              <div>
                <label className="block font-medium mb-1">Preferred Time to Call You</label>
                <select name="contactTime" value={form.contactTime} onChange={handleChange} required className="input-field w-full" aria-label="Preferred contact time">
                  <option value="">Select time</option>
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Do you need:</label>
              <div className="flex flex-wrap gap-4">
                {services.map((s) => (
                  <label key={s.key} className="flex items-center gap-2 min-h-10">
                    <input type="checkbox" name="services" value={s.key} checked={form.services.includes(s.key)} onChange={handleChange} className="min-w-5 min-h-5 sm:min-w-6 sm:min-h-6" />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Any theme or special instructions?</label>
              <textarea name="theme" value={form.theme} onChange={handleChange} placeholder="Theme, color, special requests..." className="input-field w-full" />
            </div>
            <button
              type="submit"
              className="input-field w-full bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-full shadow transition text-lg mt-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
              disabled={!session || loading}
            >
              {session ? 'Submit Event Details' : 'Sign in to Submit'}
            </button>
            {!session && (
              <div className="text-red-600 mt-2">
                Please <button type="button" onClick={() => signIn()} className="underline text-blue-600">sign in</button> to submit your event.
              </div>
            )}
          </form>
        </motion.div>
      )}
      {submitted && (
        <div className="w-full max-w-5xl mx-auto mb-10 bg-white/70 border border-green-200 rounded-xl shadow-2xl p-8 text-center backdrop-blur-[6px]">
          <div className="text-3xl font-bold text-green-700 mb-2">Thank you for submitting your event details!</div>
          <div className="text-lg text-green-800 mb-2">Our expert event planners will contact you soon to finalize your plan.</div>
          <div className="text-gray-700">You can review your estimated package below. We’ve also sent a summary to your email/SMS.</div>
        </div>
      )}

      {/* Sticky Submit Button for Mobile */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-gradient-to-t from-white/90 via-white/80 to-transparent px-4 py-3 flex justify-center sm:hidden">
        <button type="submit" form="plan-form-main" className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-full shadow transition text-lg w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-primary-400">Submit Event Details</button>
      </div>

      {/* Estimated Package Section - move this above Personal Event Team */}
      <div className="w-full max-w-5xl mx-auto mb-10">
        <div className={`rounded-xl shadow-2xl p-8 ${estimate.min === 0 && estimate.max === 0 ? 'bg-white/70 border border-gray-200 text-center backdrop-blur-[6px]' : 'bg-white/70 border border-green-200 backdrop-blur-[6px]'}`}>
          <div className="text-2xl font-bold text-green-700 mb-2">💰 Your Estimated Package</div>
          {(estimate.min === 0 && estimate.max === 0) ? (
            <div className="text-xl font-semibold text-gray-500 mb-2 py-8">Not yet estimated</div>
          ) : (
            <>
              <div className="text-3xl font-extrabold text-green-800 mb-2">
                ₹{estimate.min?.toLocaleString()} – ₹{estimate.max?.toLocaleString()}
              </div>
              <div className="text-gray-700 mb-2">
                Based on your inputs and real-time data, we estimate your event may cost between ₹{estimate.min?.toLocaleString()} and ₹{estimate.max?.toLocaleString()}.
              </div>
              {estimate.breakdown && (
                <div className="text-sm text-gray-600 mb-2">
                  <b>Breakdown:</b> Venue: ₹{estimate.breakdown.hallMin?.toLocaleString()} – ₹{estimate.breakdown.hallMax?.toLocaleString()},
                  Services: ₹{estimate.breakdown.serviceMin?.toLocaleString()} – ₹{estimate.breakdown.serviceMax?.toLocaleString()},
                  Guests: ₹{estimate.breakdown.guestCost?.toLocaleString()}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* WeEnYou Will Handle Everything */}
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.2 }} className="w-full max-w-5xl bg-gradient-to-r from-pink-50 via-white to-blue-50 rounded-xl shadow-2xl p-8 mb-10 border border-pink-100 backdrop-blur-[6px] bg-white/60">
        <UserGroupIcon className="w-8 h-8 text-pink-400 mb-2" />
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">👥 Your Personal Event Team</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1 mb-2">
          <li>Curate a personalized plan</li>
          <li>Suggest the best venue and vendors</li>
          <li>Assign a dedicated event manager</li>
          <li>Be present on the event day to ensure everything runs smoothly</li>
        </ul>
      </motion.div>

      {/* FAQs Section (collapsible) */}
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.45 }} className="w-full max-w-5xl bg-gradient-to-r from-blue-50 via-white to-pink-50 rounded-xl shadow p-8 mb-10 border border-blue-100 backdrop-blur-[6px] bg-white/60">
        <QuestionMarkCircleIcon className="w-8 h-8 text-blue-400 mb-2" />
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">❓ FAQs</h2>
        <div className="mb-2">
          <button className="w-full text-left font-semibold flex items-center gap-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400" aria-expanded={openFaq[0]} aria-controls="faq1" onClick={() => handleFaqToggle(0)} tabIndex={0}>
            <span>Q: Will someone from WeEnYou attend my event?</span>
            <span className={`ml-auto transition-transform ${openFaq[0] ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div id="faq1" className={`text-gray-700 mb-3 transition-all duration-300 overflow-hidden ${openFaq[0] ? 'max-h-32' : 'max-h-0'}`}>{openFaq[0] && 'A: Yes. A dedicated event manager will be present on-site throughout your event.'}</div>
          <button className="w-full text-left font-semibold flex items-center gap-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400" aria-expanded={openFaq[1]} aria-controls="faq2" onClick={() => handleFaqToggle(1)} tabIndex={0}>
            <span>Q: What if something goes wrong during the event?</span>
            <span className={`ml-auto transition-transform ${openFaq[1] ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div id="faq2" className={`text-gray-700 transition-all duration-300 overflow-hidden ${openFaq[1] ? 'max-h-32' : 'max-h-0'}`}>{openFaq[1] && 'A: We handle vendor coordination, timing, and troubleshooting so you don’t have to.'}</div>
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.7, delay: 0.65 }} className="w-full max-w-5xl bg-gradient-to-r from-pink-500 to-orange-400 rounded-xl shadow p-8 mb-10 text-center text-white relative overflow-hidden backdrop-blur-[6px] bg-white/70">
        <SparklesIcon className="w-16 h-16 text-white/30 absolute right-6 top-6 animate-spin-slow" />
        <h2 className="text-2xl font-bold mb-2">Let WeEnYou Plan and Organize Your Event from Start to Finish.</h2>
        <p className="mb-4">📝 Submit Your Event Details → 🎯 We’ll Take It From There.</p>
        <a href="#plan-form" className="inline-block bg-white text-primary-700 font-bold px-8 py-3 rounded-full shadow transition text-lg">Submit Event Details</a>
      </motion.div>

      {/* Floating Ask an Expert Button */}
      <button className="fixed bottom-20 right-4 z-50 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full shadow-lg text-base font-semibold flex items-center gap-2 sm:px-8 sm:py-4 transition-all" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }} onClick={() => alert('Live chat coming soon!')}>
        <ChatBubbleLeftRightIcon className="w-6 h-6" /> Ask an Expert
      </button>
    </div>
  );
} 