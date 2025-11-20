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
    if (!form.name.trim()) errors.name = 'Name is required.';
    if (!form.phone.trim() || !/^[0-9]{10,}$/.test(form.phone.trim())) errors.phone = 'Valid phone number is required.';
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) errors.email = 'Valid email is required.';
    if (!form.startDate) errors.startDate = 'Start date is required.';
    if (!form.endDate) errors.endDate = 'End date is required.';
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) errors.endDate = 'End date cannot be before start date.';
    if (!form.eventTime) errors.eventTime = 'Event time is required.';
    if (!form.guests || isNaN(Number(form.guests)) || Number(form.guests) <= 0) errors.guests = 'Number of guests is required.';
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
      setForm((prev) => ({
        ...prev,
        startDate: searchParams.get("date") || prev.startDate,
        endDate: searchParams.get("date") || prev.endDate, // Assuming endDate is the same as startDate for single-day
        guests: searchParams.get("guests") || prev.guests,
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
  // Owner's price
  const ownerVenuePrice = hall?.basePrice || hall?.price || 0;
  // Platform fee (silent)
  const platformFeePercent = typeof hall?.platformFeePercent === 'number' ? hall.platformFeePercent : 10;
  const platformFee = Math.round(ownerVenuePrice * (platformFeePercent / 100));
  // Admin-set price (shown as Venue Price)
  const adminVenuePrice = ownerVenuePrice + platformFee;
  const taxOnPlatformFee = Math.round(platformFee * 0.18);
  const taxOnEventManagerFee = eventManager ? Math.round(EVENT_MANAGER_FEE * 0.18) : 0;
  const totalTaxes = taxOnPlatformFee + taxOnEventManagerFee;
  const servicesPrice = selectedServices.reduce((sum, s) => {
    if (s.serviceType === "Catering" || s.id === "catering") {
      return sum + guestsCount * (s.price || s.avgPrice);
    }
    return sum + (s.price || s.avgPrice);
  }, 0);
  const eventManagerPrice = eventManager ? EVENT_MANAGER_FEE : 0;
  const subtotal = adminVenuePrice + servicesPrice + eventManagerPrice;
  const total = subtotal + totalTaxes - discount;

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
    setForm((prev) => ({ ...prev, [name]: value }));
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

  // Add state for editable advance
  const minAdvance = getAdvanceAmount(total);
  const maxAdvance = total;
  const [advance, setAdvance] = useState('');
  const [advanceError, setAdvanceError] = useState<string | null>(null);

  const handleAdvanceChange = (value: string) => {
    setAdvance(value);
    const num = Number(value);
    if (!value) {
      setAdvanceError(null);
    } else if (isNaN(num)) {
      setAdvanceError('Please enter a valid number.');
    } else if (num > maxAdvance) {
      setAdvanceError('Advance cannot be greater than the total booking amount.');
    } else if (num < minAdvance) {
      setAdvanceError(`Advance must be at least ₹${minAdvance.toLocaleString()}.`);
    } else {
      setAdvanceError(null);
    }
  };

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
    const advanceAmount = Number(advance);
    if (!advance || isNaN(advanceAmount) || advanceAmount < minAdvance || advanceAmount > maxAdvance) {
      setAdvanceError('Please enter a valid advance amount.');
      return;
    }
    setSubmitting(true);
    setError("");
    setSubmitError("");
    try {
      // 1. Create booking first
      const bookingBody = {
        hallId,
        startDate: form.startDate,
        endDate: form.endDate,
        guests: guestsCount,
        specialRequests: form.specialRequests,
        services: selectedServices.map((s) => ({
          name: s.name,
          price: s.price || s.avgPrice,
        })),
        servicesTotal: servicesPrice,
        eventManager,
        eventManagerDetails,
        user: {
          name: form.name,
          email: form.email,
          phone: form.phone,
        },
        totalAmount: total,
      };
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingBody),
      });
      if (!bookingRes.ok) {
        const errData = await bookingRes.json();
        setSubmitError(errData.error || "Booking creation failed");
        setSubmitting(false);
        return;
      }
      const bookingData = await bookingRes.json();
      const bookingId = bookingData.booking?._id || bookingData.bookingId;
      if (!bookingId) {
        setSubmitError("Booking creation failed: No booking ID returned");
        setSubmitting(false);
        return;
      }
      // 2. Create Razorpay order for ADVANCE payment only
      const paymentRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount: advanceAmount,
          type: "advance"
        }),
      });
      const paymentData = await paymentRes.json();
      if (!paymentData.order || !paymentData.order.id) {
        setSubmitError("Failed to create payment order. Please try again.");
        setSubmitting(false);
        return;
      }
      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentData.order.amount,
        currency: paymentData.order.currency,
        name: "WeEnYou",
        description: "Venue Booking",
        order_id: paymentData.order.id,
        handler: function (response: any) {
          // Redirect to pending page after payment
          router.push(`/bookings/${bookingId}/pending`);
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#3399cc" },
      };
      // Wait for Razorpay script to be loaded
      if (window.Razorpay) {
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setSubmitError("Payment system not loaded. Please try again in a moment.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const [showAllServices, setShowAllServices] = useState(false);
  const servicesToShow = showAllServices ? services : services.slice(0, 4);

  // Add refs for each section
  const summaryRef = useRef(null);
  const servicesRef = useRef(null);
  const eventManagerRef = useRef(null);
  const detailsRef = useRef(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(false);

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
      <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-start py-8 px-2 md:px-8">
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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col items-center justify-start py-8 px-2 md:px-8">
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-8">
        {/* Left Column */}
        <div className="flex-1 min-w-0 space-y-8">
          {/* 1. Booking Summary */}
          <section className="bg-white rounded-2xl shadow-2xl p-6 flex gap-6 items-center border border-gray-200">
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
                <li>💰 <b>Base Price:</b> ₹{adminVenuePrice.toLocaleString()}</li>
                <li>🛎️ <b>Selected Services:</b> {selectedServices.length === 0 ? "None yet" : selectedServices.map(s => s.name).join(", ")}</li>
              </ul>
              <div className="mt-3">
                <a href="/help#cancellation-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs font-semibold hover:text-blue-800 transition">View Cancellation & Refund Policy</a>
              </div>
            </div>
          </section>
          {/* 2. Add Nearby Services */}
          <section className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-extrabold mb-3 flex items-center gap-3 text-gray-900">🧩 Add Nearby Services</h2>
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
          <section className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-2xl font-extrabold flex items-center gap-2 text-gray-900">🧑‍💼 Event Manager (Optional)</h2>
              <input
                type="checkbox"
                className="accent-gray-700 ml-2 scale-125"
                checked={eventManager}
                onChange={() => setEventManager(v => !v)}
              />
              <span className="text-base">Yes, assign me an Event Manager</span>
            </div>
            {eventManager && (
              <div className="space-y-3 mt-2">
                <div className="flex gap-3">
                  <label className="flex-1 text-base">📅 Preferred Contact Date
                    <input type="date" name="contactDate" value={eventManagerDetails.contactDate} onChange={handleEventManagerDetailsChange} className="block w-full border rounded p-2 mt-1" />
                  </label>
                  <label className="flex-1 text-base">👥 Expected Guests
                    <input type="number" name="guests" value={eventManagerDetails.guests} onChange={handleEventManagerDetailsChange} className="block w-full border rounded p-2 mt-1" />
                  </label>
                </div>
                <div className="flex gap-3">
                  <label className="flex-1 text-base">🕘 Event Start Time
                    <input type="time" name="startTime" value={eventManagerDetails.startTime} onChange={handleEventManagerDetailsChange} className="block w-full border rounded p-2 mt-1" />
                  </label>
                </div>
                <label className="text-base">💬 Special Notes
                  <textarea name="notes" value={eventManagerDetails.notes} onChange={handleEventManagerDetailsChange} className="block w-full border rounded p-2 mt-1" rows={2} />
                </label>
                <div className="text-gray-700 font-bold mt-2 text-base">💰 Event Manager Service Fee: ₹{EVENT_MANAGER_FEE.toLocaleString()} <span className="text-xs font-normal">(includes pre-event coordination + on-ground support)</span></div>
              </div>
            )}
          </section>
          {/* 4. Final Event Details */}
          <section className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
            <h2 className="text-2xl font-extrabold mb-3 flex items-center gap-3 text-gray-900">📋 Final Event Details</h2>
            <form className="space-y-3">
              <div className="flex gap-3">
                <label className="flex-1 text-base">Name
                  <input type="text" name="name" value={form.name} onChange={handleFormChange} className={`block w-full border rounded p-2 mt-1 ${formErrors.name ? 'border-red-500' : ''}`} required />
                  {formErrors.name && <span className="text-xs text-red-600">{formErrors.name}</span>}
                </label>
                <label className="flex-1 text-base">Phone
                  <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} className={`block w-full border rounded p-2 mt-1 ${formErrors.phone ? 'border-red-500' : ''}`} required />
                  {formErrors.phone && <span className="text-xs text-red-600">{formErrors.phone}</span>}
                </label>
              </div>
              <label className="text-base">Email
                <input type="email" name="email" value={form.email} onChange={handleFormChange} className={`block w-full border rounded p-2 mt-1 ${formErrors.email ? 'border-red-500' : ''}`} required />
                {formErrors.email && <span className="text-xs text-red-600">{formErrors.email}</span>}
              </label>
              <div className="flex gap-3">
                <label className="flex-1 text-base">Start Date
                  <input type="date" name="startDate" value={form.startDate} onChange={handleFormChange} className={`block w-full border rounded p-2 mt-1 ${formErrors.startDate ? 'border-red-500' : ''}`} required />
                  {formErrors.startDate && <span className="text-xs text-red-600">{formErrors.startDate}</span>}
                </label>
                <label className="flex-1 text-base">End Date
                  <input type="date" name="endDate" value={form.endDate} onChange={handleFormChange} className={`block w-full border rounded p-2 mt-1 ${formErrors.endDate ? 'border-red-500' : ''}`} required />
                  {formErrors.endDate && <span className="text-xs text-red-600">{formErrors.endDate}</span>}
                </label>
              </div>
              <label className="text-base">Event Time
                <input type="time" name="eventTime" value={form.eventTime} onChange={handleFormChange} className={`block w-full border rounded p-2 mt-1 ${formErrors.eventTime ? 'border-red-500' : ''}`} required />
                {formErrors.eventTime && <span className="text-xs text-red-600">{formErrors.eventTime}</span>}
              </label>
              <label className="text-base">Number of Guests
                <input type="number" name="guests" value={form.guests} onChange={handleFormChange} className={`block w-full border rounded p-2 mt-1 ${formErrors.guests ? 'border-red-500' : ''}`} required />
                {formErrors.guests && <span className="text-xs text-red-600">{formErrors.guests}</span>}
              </label>
              <label className="text-base">Special Requests
                <textarea name="specialRequests" value={form.specialRequests} onChange={handleFormChange} className="block w-full border rounded p-2 mt-1" rows={2} />
              </label>
            </form>
          </section>
          {/* 6. Call to Action */}
          <div className="mt-6">
            <button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-extrabold py-4 rounded-2xl text-xl shadow-lg transition-all disabled:opacity-60 transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 animate-pulse"
              onClick={() => setShowReviewModal(true)}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "🎉 Proceed to Pay & Confirm Booking"}
            </button>
            {!user && <div className="text-red-600 text-base mt-2 font-semibold">Please sign in to book.</div>}
            {submitError && (
              <div className="flex flex-col items-center gap-2 mt-4">
                <div className="text-red-600 text-base font-semibold">{submitError}</div>
                <button
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow"
                  onClick={handleProceedToPay}
                  disabled={submitting}
                >
                  Retry
                </button>
              </div>
            )}
          </div>
          {/* Add Save for Later and Clear Draft buttons below the booking form (before the call to action) */}
          <div className="flex gap-4 mt-4">
            <button
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-300 shadow"
              type="button"
              onClick={handleSaveForLater}
            >
              Save for Later
            </button>
            {draftLoaded && (
              <button
                className="px-4 py-2 rounded bg-red-200 hover:bg-red-300 text-red-900 font-semibold transition transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300 shadow"
                type="button"
                onClick={handleClearDraft}
              >
                Clear Draft
              </button>
            )}
          </div>
        </div>
        {/* Right Column: Sticky Cost Summary */}
        <aside className="w-full md:w-96 md:sticky md:top-8 h-fit">
          <div className="bg-white/95 rounded-2xl shadow-2xl p-6 mb-6 border-2 border-gray-200">
            <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-3 text-gray-900">💸 Final Cost Summary</h2>
            <table className="w-full text-base mb-3">
              <tbody>
                <tr><td>Venue</td><td className="text-right">₹{adminVenuePrice.toLocaleString()}</td></tr>
                {selectedServices.map(s => (
                  <tr key={s._id || s.id}>
                    <td>{s.name}{(s.serviceType === "Catering" || s.id === "catering") && form.guests ? ` (${form.guests} x ₹${s.price || s.avgPrice})` : ""}</td>
                    <td className="text-right">₹{(s.serviceType === "Catering" || s.id === "catering") && form.guests ? (guestsCount * (s.price || s.avgPrice)).toLocaleString() : (s.price || s.avgPrice).toLocaleString()}</td>
                  </tr>
                ))}
                {eventManager && <tr><td>Event Manager</td><td className="text-right">₹{EVENT_MANAGER_FEE.toLocaleString()}</td></tr>}
                {totalTaxes > 0 && <tr><td>Taxes</td><td className="text-right">₹{totalTaxes.toLocaleString()}</td></tr>}
                {discount > 0 && <tr className="text-gray-700"><td>Discount</td><td className="text-right">-₹{discount.toLocaleString()}</td></tr>}
                <tr className="border-t-2 border-gray-300 font-extrabold text-xl"><td>Total</td><td className="text-right">₹{total.toLocaleString()}</td></tr>
              </tbody>
            </table>
            <div className="flex gap-3 mt-3">
              <input
                type="text"
                placeholder="Coupon code"
                className="flex-1 border-2 border-gray-200 rounded-lg p-2 focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
              />
              <button
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-bold shadow-md transition"
                onClick={handleApplyCoupon}
                type="button"
              >Apply</button>
            </div>
          </div>
        </aside>
      </div>
      {/* Service Reviews Modal */}
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
      <div className="mt-12 text-center w-full">
        <a href="/help" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 underline font-extrabold text-lg hover:text-blue-900 transition">
          <span>❓ Need Help? Contact Support</span>
        </a>
      </div>
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col relative border-2 border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-extrabold text-gray-900">Review Your Booking</h3>
                <button className="text-gray-500 hover:text-gray-700 text-2xl font-bold" onClick={() => setShowReviewModal(false)}>&times;</button>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Booking Summary */}
              <div ref={summaryRef} className="border-b border-gray-200 pb-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-base">Venue</div>
                  <button className="text-blue-600 underline text-sm" onClick={() => { setShowReviewModal(false); summaryRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>Edit</button>
                </div>
                <div className="text-sm text-gray-700">{hall ? `${hall.name}, ${hall.location?.city || hall.city}` : "Loading..."}</div>
              </div>
              
              {/* Services */}
              <div ref={servicesRef} className="border-b border-gray-200 pb-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-base">Services</div>
                  <button className="text-blue-600 underline text-sm" onClick={() => { setShowReviewModal(false); servicesRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>Edit</button>
                </div>
                <div className="text-sm text-gray-700">{selectedServices.length === 0 ? "None" : selectedServices.map(s => s.name).join(", ")}</div>
              </div>
              
              {/* Event Manager */}
              <div ref={eventManagerRef} className="border-b border-gray-200 pb-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-base">Event Manager</div>
                  <button className="text-blue-600 underline text-sm" onClick={() => { setShowReviewModal(false); eventManagerRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>Edit</button>
                </div>
                <div className="text-sm text-gray-700">{eventManager ? `Yes (Fee: ₹${EVENT_MANAGER_FEE.toLocaleString()})` : "No"}</div>
              </div>
              
              {/* Final Event Details */}
              <div ref={detailsRef} className="border-b border-gray-200 pb-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-base">Event Details</div>
                  <button className="text-blue-600 underline text-sm" onClick={() => { setShowReviewModal(false); detailsRef.current?.scrollIntoView({ behavior: 'smooth' }); }}>Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700">
                  <div><b>Name:</b> {form.name}</div>
                  <div><b>Phone:</b> {form.phone}</div>
                  <div><b>Email:</b> {form.email}</div>
                  <div><b>Date:</b> {form.startDate}</div>
                  <div><b>Time:</b> {form.eventTime}</div>
                  <div><b>Guests:</b> {form.guests}</div>
                  <div className="col-span-2"><b>Special Requests:</b> {form.specialRequests || "-"}</div>
                </div>
              </div>
              
              {/* Cost Summary */}
              <div className="font-bold text-lg flex justify-between items-center py-2">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              
              {/* Advance Payment Info */}
              <div className="p-3 bg-blue-50 border border-blue-300 rounded text-blue-900">
                <label className="block mb-2 font-semibold text-sm">
                  Enter Advance Amount (min: ₹{minAdvance.toLocaleString()}, max: ₹{maxAdvance.toLocaleString()}):
                  <input
                    type="number"
                    value={advance}
                    onChange={e => handleAdvanceChange(e.target.value)}
                    className="block w-full border rounded p-2 mt-1 text-base font-bold"
                  />
                  {advanceError && (
                    <div className="text-xs text-red-600 mt-1">{advanceError}</div>
                  )}
                </label>
                <span className="text-xs font-normal text-blue-700">
                  You must pay at least 50% of total or ₹50,000, whichever is lower.
                </span>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold transition text-sm" onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold transition text-sm" onClick={async () => { setShowReviewModal(false); setPendingBooking(true); await handleProceedToPay(); setPendingBooking(false); }}>Pay Advance & Request Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage; 