"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import ReviewList from '@/components/ReviewList';
import Image from 'next/image';

const EVENT_MANAGER_FEE = 4999;
const PLATFORM_FEE_PERCENT = 0.1;

const BookingPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hallId = params?.id as string;

  // State
  const [hall, setHall] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [eventManager, setEventManager] = useState(false);
  const [eventManagerDetails, setEventManagerDetails] = useState({
    contactDate: "",
    guests: "",
    startTime: "",
    notes: "",
  });
  // Update form state to include startDate and endDate
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    startDate: "",
    endDate: "",
    eventTime: "",
    guests: "",
    specialRequests: "",
  });
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  // Add a retry state for fetch errors
  const [retryCount, setRetryCount] = useState(0);

  // Validation state
  const [formErrors, setFormErrors] = useState<any>({});

  // Update validation logic
  const validateForm = () => {
    const errors: any = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!form.name.trim()) errors.name = 'Name is required.';
    if (!form.phone.trim() || !/^[0-9]{10,}$/.test(form.phone.trim())) errors.phone = 'Valid phone number (min 10 digits) is required.';
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) errors.email = 'Valid email is required.';
    
    // Date Validation
    if (!form.startDate) {
      errors.startDate = 'Start date is required.';
    } else {
      const start = new Date(form.startDate);
      if (start < today) errors.startDate = 'Date cannot be in the past.';
    }

    if (!form.endDate) {
      errors.endDate = 'End date is required.';
    } else if (form.startDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (end < start) errors.endDate = 'End date cannot be earlier than start date.';
    }

    // Time Validation
    if (!form.eventTime) {
      errors.eventTime = 'Event time is required.';
    } else if (form.startDate) {
      const start = new Date(form.startDate);
      const now = new Date();
      if (start.toDateString() === now.toDateString()) {
        const [hours, minutes] = form.eventTime.split(':').map(Number);
        const selectedTime = new Date();
        selectedTime.setHours(hours, minutes, 0, 0);
        if (selectedTime < now) errors.eventTime = 'Time cannot be in the past for today.';
      }
    }

    // Guest Validation
    const gCount = Number(form.guests);
    if (!form.guests || isNaN(gCount) || gCount <= 0) {
      errors.guests = 'Number of guests must be greater than 0.';
    } else if (hall?.capacity && gCount > hall.capacity) {
      errors.guests = `Capacity exceeded (Max: ${hall.capacity} guests).`;
    }

    return errors;
  };

  // Real-time validation
  useEffect(() => {
    setFormErrors(validateForm());
    // eslint-disable-next-line
  }, [form]);

  // Pre-fill from query params
  useEffect(() => {
    if (searchParams) {
      const qStartDate = searchParams.get("startDate") || searchParams.get("date");
      const qEndDate = searchParams.get("endDate") || searchParams.get("date");
      const qGuests = searchParams.get("guests");
      const qSpecialRequests = searchParams.get("specialRequests");

      setForm((prev) => ({
        ...prev,
        startDate: qStartDate || prev.startDate,
        endDate: qEndDate || prev.endDate,
        guests: qGuests || prev.guests,
        specialRequests: qSpecialRequests || prev.specialRequests,
      }));
    }
  }, [searchParams]);

  // Fetch user session (for authentication)
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
        else setUser(null);
      });
  }, []);

  // Fetch hall details and services
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        // Fetch hall details
        const hallRes = await fetch(`/api/halls/${hallId}`);
        if (!hallRes.ok) throw new Error("Failed to fetch hall details");
        const hallData = await hallRes.json();
        setHall(hallData.hall);
        // Fetch services by city
        const city = hallData.hall?.location?.city || hallData.hall?.city;
        const servicesRes = await fetch(`/api/services?city=${encodeURIComponent(city || "")}`);
        if (!servicesRes.ok) throw new Error("Failed to fetch services");
        const servicesData = await servicesRes.json();
        setServices(servicesData.services || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    if (hallId) fetchData();
  }, [hallId, retryCount]);

  // Prefill user info if logged in
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // For service reviews modal
  const [serviceReviewsModal, setServiceReviewsModal] = useState<{service: any, open: boolean}>({service: null, open: false});
  const [serviceReviews, setServiceReviews] = useState<any[]>([]);
  const [serviceReviewsMeta, setServiceReviewsMeta] = useState<{total: number, avg: number, dist: any}>({total: 0, avg: 0, dist: {}});
  const [loadingReviews, setLoadingReviews] = useState(false);

  const openServiceReviews = async (service: any) => {
    setServiceReviewsModal({service, open: true});
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/services/${service._id || service.id}/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setServiceReviews(data.reviews || []);
      // Calculate meta
      const total = data.reviews?.length || 0;
      const avg = total ? (data.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / total) : 0;
      const dist: any = {};
      data.reviews?.forEach((r: any) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
      setServiceReviewsMeta({total, avg, dist});
    } catch {
      setServiceReviews([]);
      setServiceReviewsMeta({total: 0, avg: 0, dist: {}});
    } finally {
      setLoadingReviews(false);
    }
  };

  const closeServiceReviews = () => {
    setServiceReviewsModal({service: null, open: false});
    setServiceReviews([]);
    setServiceReviewsMeta({total: 0, avg: 0, dist: {}});
  };

  // Cost calculation
  const guestsCount = parseInt(form.guests) || 0;
  
  // Date-based calculation
  const getDays = () => {
    if (!form.startDate || !form.endDate) return 1;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diff = end.getTime() - start.getTime();
    if (diff < 0) return 1;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const totalDays = getDays();
  
  // Base Venue Price (Daily)
  const dailyPrice = hall?.price || hall?.basePrice || 0;
  const venueRental = dailyPrice * totalDays;
  
  // Platform Fee (Charged once based on ONE day's price)
  const platformFeePercent = typeof hall?.platformFeePercent === 'number' ? hall.platformFeePercent : 10;
  const platformFee = Math.round(dailyPrice * (platformFeePercent / 100));

  // Taxes (18% on platform fee - existing rule)
  const taxAmount = Math.round(platformFee * 0.18);
  
  // Services Price
  const servicesPrice = selectedServices.reduce((sum, s) => {
    if (s.serviceType === "Catering" || s.id === "catering") {
      return sum + guestsCount * (s.price || s.avgPrice);
    }
    return sum + (s.price || s.avgPrice);
  }, 0);

  // Event Manager Price
  const eventManagerPrice = eventManager ? EVENT_MANAGER_FEE : 0;

  // Subtotal
  const subtotal = venueRental + platformFee + taxAmount + servicesPrice + eventManagerPrice;
  
  // Total including discount
  const total = Math.max(0, subtotal - discount);

  // Handlers
  const handleServiceToggle = (service: any) => {
    setSelectedServices((prev) => {
      if (prev.find((s) => s._id === service._id || s.id === service.id)) {
        return prev.filter((s) => (s._id || s.id) !== (service._id || service.id));
      } else {
        return [...prev, service];
      }
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-validate/reset end date if start date changes
      if (name === 'startDate' && updated.endDate && new Date(updated.endDate) < new Date(value)) {
        updated.endDate = value;
      }
      return updated;
    });
  };

  const handleEventManagerDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventManagerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = () => {
    // Mock: flat 5% discount for code "SAVE5"
    if (coupon.trim().toUpperCase() === "SAVE5") {
      setDiscount(Math.round(total * 0.05));
    } else {
      setDiscount(0);
    }
  };

  const [submitError, setSubmitError] = useState("");

  // Utility function for advance calculation
  const getAdvanceAmount = (total: number) => Math.min(50000, total * 0.5);

  // Replace handleProceedToPay with booking-first, then payment flow
  const handleProceedToPay = async () => {
    if (!user) {
      alert("Please sign in to book.");
      return;
    }
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Save booking data to localStorage for the review page
    const bookingDraft = {
      hallId,
      form,
      selectedServices,
      eventManager,
      eventManagerDetails,
      // Pass calculated totals to the review page
      dailyPrice,
      totalDays,
      venueRental,
      platformFee,
      taxAmount,
      servicesPrice,
      total
    };
    localStorage.setItem('booking_review_data', JSON.stringify(bookingDraft));
    
    // Navigate to review page
    router.push(`/halls/${hallId}/book/review`);
  };

  const [showAllServices, setShowAllServices] = useState(false);
  const servicesToShow = showAllServices ? services : services.slice(0, 4);

  // Add refs for each section

  // Add state for draft loaded
  const [draftLoaded, setDraftLoaded] = useState(false);

  // On mount, check for saved draft
  useEffect(() => {
    const draft = localStorage.getItem('bookingDraft');
    if (draft) {
      if (window.confirm('You have a saved booking draft. Would you like to restore it?')) {
        const data = JSON.parse(draft);
        setForm(data.form || {});
        setSelectedServices(data.selectedServices || []);
        setEventManager(data.eventManager || false);
        setEventManagerDetails(data.eventManagerDetails || {});
        setDraftLoaded(true);
      }
    }
  }, []);

  // Dynamically load Razorpay script if not present
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (loading) {
    return (
      <div className="page-mobile-first relative min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-start py-4 sm:py-8 px-4 md:px-8">
        <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8">
          {/* Left Column Skeleton */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Booking Summary Skeleton */}
            <section className="bg-white rounded-2xl shadow-2xl p-6 flex gap-6 items-center border border-gray-200 animate-pulse">
              <div className="w-28 h-28 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </section>
            {/* Services Skeleton */}
            <section className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-2 rounded-xl p-4 bg-gray-100">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {/* Event Manager Skeleton */}
            <section className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </section>
            {/* Final Event Details Skeleton */}
            <section className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </section>
            <div className="mt-6">
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
          </div>
          {/* Right Column Skeleton */}
          <aside className="w-full md:w-96 md:sticky md:top-8 h-fit">
            <div className="bg-white/95 rounded-2xl shadow-2xl p-6 mb-6 border-2 border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="space-y-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full" />
                ))}
              </div>
              <div className="h-10 bg-gray-200 rounded w-full mt-3" />
            </div>
          </aside>
        </div>
      </div>
    );
  }
  if (error) {
    let friendlyError = error;
    if (error.toLowerCase().includes('date') && error.toLowerCase().includes('book')) {
      friendlyError = 'This date is already booked. Please choose another date.';
    } else if (error.toLowerCase().includes('network')) {
      friendlyError = 'Network error. Please check your connection and try again.';
    }
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-red-600 gap-4">
        <div>{friendlyError}</div>
        <button
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow"
          onClick={() => setRetryCount(c => c + 1)}
        >
          Retry
        </button>
      </div>
    );
  }

  // Save for Later handler
  const handleSaveForLater = () => {
    const draft = {
      form,
      selectedServices,
      eventManager,
      eventManagerDetails,
    };
    localStorage.setItem('bookingDraft', JSON.stringify(draft));
    alert('Your booking progress has been saved!');
  };
  // Clear Draft handler
  const handleClearDraft = () => {
    localStorage.removeItem('bookingDraft');
    setDraftLoaded(false);
    alert('Draft cleared.');
  };

  return (
    <div className="page-mobile-first relative min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-br from-gray-50 via-white to-gray-100 py-4 sm:py-8 px-4 sm:px-6 md:px-8 pb-32 md:pb-8">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 min-w-0 space-y-6 md:space-y-8 overflow-hidden">
          {/* 1. Booking Summary */}
          <section className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center border border-gray-200 max-w-full overflow-hidden">
            {/* Venue Image */}
            {hall?.images?.[0] && (
              <div className="w-28 h-28 relative flex-shrink-0 overflow-hidden rounded-xl border-2 border-gray-200 shadow-md">
                <Image src={hall.images[0]} alt={hall.name} fill className="object-cover" loading="lazy" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold mb-3 flex items-center gap-3 text-gray-900">🧾 Booking Summary
                <span className="ml-2 inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-300 shadow-sm">🔒 Secure Payment</span>
                {hall?.verified && <span className="ml-2 inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-300 shadow-sm">✔️ Verified Venue</span>}
              </h2>
              <ul className="space-y-1 text-gray-700 text-base">
                <li>✅ <b>Venue:</b> {hall ? `${hall.name}, ${hall.location?.city || hall.city}` : "Loading..."}</li>
                <li>📅 <b>Date & Time:</b> {form.startDate ? form.startDate : 'Not selected'}{form.eventTime ? (', ' + form.eventTime) : ''}</li>
                <li>👥 <b>Guests:</b> {form.guests ? form.guests : 'Not provided'}</li>
                <li>💰 <b>Venue Rental:</b> ₹{dailyPrice.toLocaleString()} {totalDays > 1 ? `x ${totalDays} days` : '(1 day)'} — ₹{venueRental.toLocaleString()}</li>
                <li>🛡️ <b>Platform Fee:</b> ₹{platformFee.toLocaleString()} (one-time)</li>
                <li>⚖️ <b>Taxes:</b> ₹{taxAmount.toLocaleString()}</li>
                <li>🛎️ <b>Selected Services:</b> {selectedServices.length === 0 ? "None yet" : selectedServices.map(s => s.name).join(", ")}</li>
              </ul>
              <div className="mt-3">
                <a href="/help#cancellation-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs font-semibold hover:text-blue-800 transition">View Cancellation & Refund Policy</a>
              </div>
            </div>
          </section>
          {/* 2. Add Nearby Services */}
          <section className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 max-w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-extrabold mb-3 flex items-center gap-3 text-gray-900">🧩 Add Nearby Services</h2>
            <p className="text-base text-gray-500 mb-3">Need other services? We've found trusted vendors near your venue.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {servicesToShow.map(service => (
                <label key={service._id || service.id} className={`flex items-center gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all shadow-sm hover:shadow-lg hover:border-gray-400 transition-transform duration-150 hover:scale-[1.02] ${selectedServices.find(s => (s._id || s.id) === (service._id || service.id)) ? "border-gray-700 bg-gray-50" : "border-gray-200"}`}> 
                  <input
                    type="checkbox"
                    className="accent-gray-700 scale-125"
                    checked={!!selectedServices.find(s => (s._id || s.id) === (service._id || service.id))}
                    onChange={() => handleServiceToggle(service)}
                  />
                  <span className="text-3xl">{service.icon || "🛎️"}</span>
                  <div className="flex-1">
                    <div className="font-bold flex items-center gap-2 text-lg text-gray-900">{service.name}
                      {typeof service.averageRating === 'number' && (
                        <span className="ml-2 text-yellow-500 flex items-center text-xs font-semibold">
                          ★ {service.averageRating.toFixed(1)}
                          {service.totalReviews ? <span className="ml-1 text-gray-500">({service.totalReviews})</span> : null}
                        </span>
                      )}
                      <button type="button" className="ml-2 text-blue-600 underline text-xs hover:text-blue-800" onClick={e => {e.preventDefault(); openServiceReviews(service);}}>View Reviews</button>
                    </div>
                    <div className="text-xs text-gray-500">{service.serviceType || service.type || "Service"} • ₹{(service.price || service.avgPrice)?.toLocaleString()}</div>
                  </div>
                  <span className="text-gray-700 font-bold text-base">{selectedServices.find(s => (s._id || s.id) === (service._id || service.id)) ? "Added" : "+ Add"}</span>
                </label>
              ))}
            </div>
            {!showAllServices && services.length > 4 && (
              <div className="flex justify-center mt-2">
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow"
                  onClick={() => setShowAllServices(true)}
                  type="button"
                >
                  Show More Services
                </button>
              </div>
            )}
          </section>
          {/* 3. Event Manager Option */}
          <section className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-200 max-w-full overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2 text-gray-900">🧑‍💼 Event Manager</h2>
              <input
                type="checkbox"
                className="accent-primary-600 scale-125 cursor-pointer"
                checked={eventManager}
                onChange={() => setEventManager(v => !v)}
              />
            </div>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${eventManager ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-sm font-bold text-gray-700">📅 Preferred Contact Date
                    <input type="date" name="contactDate" min={new Date().toISOString().split('T')[0]} value={eventManagerDetails.contactDate} onChange={handleEventManagerDetailsChange} className="block w-full border border-gray-200 rounded-xl p-3 mt-1.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                  </label>
                  <label className="block text-sm font-bold text-gray-700">👥 Expected Guests
                    <input type="number" name="guests" value={eventManagerDetails.guests} onChange={handleEventManagerDetailsChange} className="block w-full border border-gray-200 rounded-xl p-3 mt-1.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="e.g. 150" />
                  </label>
                </div>
                <label className="block text-sm font-bold text-gray-700">🕘 Event Start Time
                  <input type="time" name="startTime" value={eventManagerDetails.startTime} onChange={handleEventManagerDetailsChange} className="block w-full border border-gray-200 rounded-xl p-3 mt-1.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
                </label>
                <label className="block text-sm font-bold text-gray-700">💬 Special Notes
                  <textarea name="notes" value={eventManagerDetails.notes} onChange={handleEventManagerDetailsChange} className="block w-full border border-gray-200 rounded-xl p-3 mt-1.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all" rows={3} placeholder="Any specific requirements for the manager..." />
                </label>
                <div className="bg-primary-50 p-4 rounded-xl border border-primary-100">
                  <div className="text-primary-900 font-bold text-sm sm:text-base flex items-center justify-between">
                    <span>Service Fee</span>
                    <span>₹{EVENT_MANAGER_FEE.toLocaleString()}</span>
                  </div>
                  <p className="text-[11px] text-primary-700 mt-1 uppercase tracking-wider font-bold">Includes pre-event coordination + on-ground support</p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Booking Form (Organized into Sections) */}
          <section className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden max-w-full">
            <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-3">📋 Booking Details</h2>
            </div>
            
            <div className="p-4 sm:p-6 space-y-8">
              {/* Section 1: Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                  <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-sm font-bold text-gray-700 w-full max-w-full">Full Name
                    <div className="w-full overflow-hidden mt-1.5">
                      <input type="text" name="name" value={form.name} onChange={handleFormChange} className={`block w-full border rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all ${formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} required placeholder="John Doe" style={{ width: '100%', maxWidth: '100%' }} />
                    </div>
                    {formErrors.name && <span className="text-xs text-red-600 mt-1 block">{formErrors.name}</span>}
                  </label>
                  <label className="block text-sm font-bold text-gray-700 w-full max-w-full">Phone Number
                    <div className="w-full overflow-hidden mt-1.5">
                      <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} className={`block w-full border rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all ${formErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} required placeholder="9876543210" style={{ width: '100%', maxWidth: '100%' }} />
                    </div>
                    {formErrors.phone && <span className="text-xs text-red-600 mt-1 block">{formErrors.phone}</span>}
                  </label>
                </div>
                <label className="block text-sm font-bold text-gray-700 w-full max-w-full">Email Address
                  <div className="w-full overflow-hidden mt-1.5">
                    <input type="email" name="email" value={form.email} onChange={handleFormChange} className={`block w-full border rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all ${formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} required placeholder="john@example.com" style={{ width: '100%', maxWidth: '100%' }} />
                  </div>
                  {formErrors.email && <span className="text-xs text-red-600 mt-1 block">{formErrors.email}</span>}
                </label>
              </div>

              {/* Section 2: Event Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                  <h3 className="text-lg font-bold text-gray-800">Event Details</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-sm font-bold text-gray-700 w-full max-w-full">Start Date
                    <div className="w-full overflow-hidden mt-1.5 label-input-wrapper">
                      <input type="date" name="startDate" min={new Date().toISOString().split('T')[0]} value={form.startDate} onChange={handleFormChange} className={`block w-full border rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all ${formErrors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} required placeholder="Select start date" style={{ width: '100%', maxWidth: '100%' }} />
                    </div>
                    {formErrors.startDate && <span className="text-xs text-red-600 mt-1 block">{formErrors.startDate}</span>}
                  </label>
                  <label className="block text-sm font-bold text-gray-700 w-full max-w-full">End Date
                    <div className="w-full overflow-hidden mt-1.5 label-input-wrapper">
                      <input type="date" name="endDate" min={form.startDate || new Date().toISOString().split('T')[0]} value={form.endDate} onChange={handleFormChange} className={`block w-full border rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all ${formErrors.endDate ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} required placeholder="Select end date" style={{ width: '100%', maxWidth: '100%' }} />
                    </div>
                    {formErrors.endDate && <span className="text-xs text-red-600 mt-1 block">{formErrors.endDate}</span>}
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-sm font-bold text-gray-700 w-full max-w-full">Event Start Time
                    <div className="w-full overflow-hidden mt-1.5 label-input-wrapper">
                      <input 
                        type="time" 
                        name="eventTime" 
                        value={form.eventTime} 
                        onChange={handleFormChange} 
                        disabled={!form.startDate} 
                        className={`block w-full border rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed ${formErrors.eventTime ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
                        required 
                        style={{ width: '100%', maxWidth: '100%' }}
                      />
                    </div>
                    {!form.startDate && <span className="text-[10px] text-gray-400 font-medium">Select date first</span>}
                    {formErrors.eventTime && <span className="text-xs text-red-600 mt-1 block">{formErrors.eventTime}</span>}
                  </label>
                  <label className="block text-sm font-bold text-gray-700 w-full max-w-full">Number of Guests
                    <div className="w-full overflow-hidden mt-1.5 label-input-wrapper">
                      <input type="number" name="guests" inputMode="numeric" value={form.guests} onChange={handleFormChange} className={`block w-full border rounded-xl p-3 focus:ring-2 focus:ring-primary-500 outline-none transition-all ${formErrors.guests ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} required placeholder={`Max: ${hall?.capacity || '...'}`} style={{ width: '100%', maxWidth: '100%' }} />
                    </div>
                    {formErrors.guests && <span className="text-xs text-red-600 mt-1 block">{formErrors.guests}</span>}
                  </label>
                </div>
                <label className="block text-sm font-bold text-gray-700">Special Requests (Optional)
                  <textarea name="specialRequests" value={form.specialRequests} onChange={handleFormChange} className="block w-full border border-gray-200 rounded-xl p-3 mt-1.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all" rows={3} placeholder="Any specific needs or preferences..." />
                </label>
              </div>
            </div>
          </section>

          {/* 6. Call to Action (Sticky on Mobile) */}
          <div className="md:mt-8 fixed bottom-0 left-0 right-0 md:relative bg-white/95 backdrop-blur-md md:bg-transparent p-4 md:p-0 border-t md:border-t-0 border-gray-100 md:shadow-none shadow-[0_-10px_30px_rgba(0,0,0,0.15)] z-[1000]">
            <div className="max-w-7xl mx-auto flex flex-col md:block">
              {/* Show price summary line on mobile sticky bar */}
              <div className="flex justify-between items-center mb-3 md:hidden px-1">
                <span className="text-gray-900 font-black">Total to pay:</span>
                <span className="text-xl font-black text-primary-600">₹{total.toLocaleString()}</span>
              </div>
              
              <button
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-4 sm:py-5 rounded-2xl text-lg sm:text-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
                onClick={handleProceedToPay}
                disabled={submitting || Object.keys(formErrors).length > 0}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                    Processing...
                  </span>
                ) : (
                  "🎉 Review & Confirm Booking"
                )}
              </button>
            </div>
            {!user && <p className="text-red-500 text-[10px] sm:text-xs mt-2 font-bold text-center bg-red-50 py-1 rounded-lg border border-red-100 md:block hidden">Sign in required.</p>}
          </div>

          <div className="h-24 md:hidden"></div> {/* Spacer for sticky button */}

          {/* Add Save for Later and Clear Draft buttons */}
          <div className="flex gap-4 mt-8 pb-8">
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition text-sm shadow-sm"
              type="button"
              onClick={handleSaveForLater}
            >
              Save for Later
            </button>
            {draftLoaded && (
              <button
                className="px-4 py-2 rounded bg-red-200 hover:bg-red-300 text-red-900 font-semibold transition text-sm shadow-sm"
                type="button"
                onClick={handleClearDraft}
              >
                Clear Draft
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Cost Summary (Moves below on mobile) */}
        <aside className="w-full lg:w-96 order-last lg:order-none lg:sticky lg:top-8 h-fit">
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">Price Breakdown</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm group">
                <span className="text-gray-500 whitespace-nowrap">Venue Rental (₹{dailyPrice.toLocaleString()} x {totalDays})</span>
                <div className="flex-1 border-b border-dotted border-gray-200 mx-2 self-end mb-1 opacity-50"></div>
                <span className="text-gray-900 font-bold">₹{venueRental.toLocaleString()}</span>
              </div>

              {selectedServices.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-0.5">Additional Services</div>
                  {selectedServices.map(s => {
                    const isCatering = s.serviceType === "Catering" || s.id === "catering";
                    const price = isCatering && guestsCount > 0 ? guestsCount * (s.price || s.avgPrice) : (s.price || s.avgPrice);
                    return (
                      <div key={s._id || s.id} className="flex justify-between items-center text-sm group">
                        <div className="flex flex-col">
                          <span className="text-gray-700 whitespace-nowrap">{s.name}</span>
                          {isCatering && guestsCount > 0 && <span className="text-[10px] text-gray-400 font-bold italic">{guestsCount} guests × ₹{(s.price || s.avgPrice).toLocaleString()}</span>}
                        </div>
                        <div className="flex-1 border-b border-dotted border-gray-100 mx-2 self-end mb-1 opacity-30"></div>
                        <span className="text-gray-900 font-bold">₹{price.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {eventManager && (
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-50 group">
                  <span className="text-gray-700 whitespace-nowrap">Event Manager Fee</span>
                  <div className="flex-1 border-b border-dotted border-gray-100 mx-2 self-end mb-1 opacity-30"></div>
                  <span className="text-gray-900 font-bold">₹{EVENT_MANAGER_FEE.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-50 group">
                <span className="text-gray-500 whitespace-nowrap">Platform Fee (one-time)</span>
                <div className="flex-1 border-b border-dotted border-gray-200 mx-2 self-end mb-1 opacity-50"></div>
                <span className="text-gray-900 font-bold">₹{platformFee.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-sm group">
                <span className="text-gray-500 whitespace-nowrap">Taxes</span>
                <div className="flex-1 border-b border-dotted border-gray-200 mx-2 self-end mb-1 opacity-50"></div>
                <span className="text-gray-900 font-bold">₹{taxAmount.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600 font-bold bg-green-50 px-3 py-2 rounded-lg">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="pt-6 border-t-2 border-dashed border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-gray-900">Total Price</span>
                  <span className="text-3xl font-black text-primary-600">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. SAVE5)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all placeholder:text-gray-300 pr-24"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                  />
                  <button
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-gray-900 text-white px-5 rounded-lg text-xs font-black hover:bg-black transition-all shadow-lg active:scale-95"
                    onClick={handleApplyCoupon}
                    type="button"
                  >
                    APPLY
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <div className="flex items-center justify-between font-black text-orange-900 text-sm mb-1">
                    <span>Advance Payment</span>
                  </div>
                  <p className="text-[10px] text-orange-700 font-bold leading-relaxed">
                    Secure your booking today with an advance payment. Specify amount on the next page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Modals & Help Links */}
      {serviceReviewsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative border-2 border-gray-200">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-3xl font-bold" onClick={closeServiceReviews}>&times;</button>
            <h3 className="text-2xl font-extrabold mb-6 text-gray-900">Reviews for {serviceReviewsModal.service?.name}</h3>
            {loadingReviews ? (
              <div className="text-center py-12 text-lg">Loading...</div>
            ) : (
              <ReviewList
                reviews={serviceReviews}
                totalReviews={serviceReviewsMeta.total}
                averageRating={serviceReviewsMeta.avg}
                ratingDistribution={serviceReviewsMeta.dist}
                onLoadMore={() => {}}
                hasMore={false}
              />
            )}
          </div>
        </div>
      )}

      {/* Need Help Support Link */}
      <div className="mt-12 text-center w-full pb-24 md:pb-12">
        <a href="/help" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 underline font-extrabold text-lg hover:text-blue-900 transition">
          <span>❓ Need Help? Contact Support</span>
        </a>
      </div>
    </div>
  );
};

export default BookingPage;