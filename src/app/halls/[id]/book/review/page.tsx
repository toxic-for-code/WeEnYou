"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

const EVENT_MANAGER_FEE = 4999;

const ReviewBookingPage = () => {
  const router = useRouter();
  const params = useParams();
  const hallId = params?.id as string;

  const [bookingData, setBookingData] = useState<any>(null);
  const [hall, setHall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [advance, setAdvance] = useState("");
  const [advanceError, setAdvanceError] = useState<string | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("booking_review_data");
    if (data) {
      const parsedData = JSON.parse(data);
      setBookingData(parsedData);
      
      // Fetch hall details again to ensure fresh data
      fetch(`/api/halls/${hallId}`)
        .then(res => res.json())
        .then(resData => {
          setHall(resData.hall);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      router.push(`/halls/${hallId}/book`);
    }
  }, [hallId, router]);

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (loading || !bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const { form, selectedServices, eventManager, eventManagerDetails, total } = bookingData;
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
  
  // Re-calculate derived prices for display
  const dailyPrice = hall?.price || hall?.basePrice || 0;
  const venueRental = dailyPrice * totalDays;
  
  const platformFeePercent = typeof hall?.platformFeePercent === 'number' ? hall.platformFeePercent : 10;
  const platformFee = Math.round(dailyPrice * (platformFeePercent / 100));
  const taxAmount = Math.round(platformFee * 0.18);
  
  const servicesPrice = selectedServices.reduce((sum: number, s: any) => {
    const p = s.serviceType === "Catering" || s.id === "catering" 
      ? guestsCount * (s.price || s.avgPrice)
      : (s.price || s.avgPrice);
    return sum + p;
  }, 0);
  
  const minAdvance = Math.min(50000, total * 0.5);
  const maxAdvance = total;

  const handleAdvanceChange = (value: string) => {
    setAdvance(value);
    const num = Number(value);
    if (!value) {
      setAdvanceError(null);
    } else if (isNaN(num)) {
      setAdvanceError("Please enter a valid number.");
    } else if (num > maxAdvance) {
      setAdvanceError("Advance cannot be greater than the total.");
    } else if (num < minAdvance) {
      setAdvanceError(`Minimum advance required: ₹${minAdvance.toLocaleString()}`);
    } else {
      setAdvanceError(null);
    }
  };

  const handleConfirmAndPay = async () => {
    const advanceAmount = Number(advance);
    if (!advance || isNaN(advanceAmount) || advanceAmount < minAdvance || advanceAmount > maxAdvance) {
      setAdvanceError("Please enter a valid advance amount.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      // 1. Create booking
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hallId,
          startDate: form.startDate,
          endDate: form.endDate,
          guests: guestsCount,
          specialRequests: form.specialRequests,
          services: selectedServices.map((s: any) => ({
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
        }),
      });

      if (!bookingRes.ok) {
        const errData = await bookingRes.json();
        throw new Error(errData.error || "Booking failed");
      }

      const { booking } = await bookingRes.json();
      const bookingId = booking?._id || booking?.id;

      // 2. Create Razorpay order
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
      if (!paymentData.order?.id) throw new Error("Payment initialization failed");

      // 3. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentData.order.amount,
        currency: paymentData.order.currency,
        name: "WeEnYou",
        description: "Venue Booking Advance",
        order_id: paymentData.order.id,
        handler: async function (response: any) {
          try {
            // Call verification API
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId,
                type: "advance",
                advanceAmount, // Pass the calculated advance amount
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              router.push(`/bookings/${bookingId}/pending`);
            } else {
              const errorData = await verifyRes.json();
              setSubmitError(errorData.error || "Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            setSubmitError("An error occurred during payment verification.");
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#C89B3C" },
      };

      if (window.Razorpay) {
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        throw new Error("Payment system not loaded");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Review Your Booking</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* 1. Venue Summary */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 overflow-hidden">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🏛️</span> Venue
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              {hall?.images?.[0] && (
                <div className="w-full md:w-32 h-32 relative rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                  <Image src={hall.images[0]} alt={hall.name} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-900">{hall?.name}</h3>
                <p className="text-gray-500 font-medium">{hall?.location?.address || hall?.address}, {hall?.location?.city || hall?.city}</p>
              </div>
            </div>
          </section>

          {/* 2. Event Details */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">📅</span> Event Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div className="flex justify-between md:flex-col gap-2">
                <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Date</span>
                <span className="text-lg font-black text-gray-900">{form.startDate} {form.endDate !== form.startDate && `to ${form.endDate}`}</span>
              </div>
              <div className="flex justify-between md:flex-col gap-2">
                <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Start Time</span>
                <span className="text-lg font-black text-gray-900">{form.eventTime}</span>
              </div>
              <div className="flex justify-between md:flex-col gap-2">
                <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Estimated Guests</span>
                <span className="text-lg font-black text-gray-900">{form.guests} People</span>
              </div>
              <div className="flex justify-between md:flex-col gap-2">
                <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Client</span>
                <span className="text-lg font-black text-gray-900">{form.name}</span>
              </div>
              <div className="md:col-span-2 flex justify-between md:flex-col gap-2 pt-2 border-t border-gray-50">
                <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Special Requests</span>
                <p className="text-gray-700 font-medium italic">{form.specialRequests || "None"}</p>
              </div>
            </div>
          </section>

          {/* 3. Services & Fees */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">🧩</span> Selected Services
            </h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-50 group">
                  <span className="text-gray-700 font-medium whitespace-nowrap">Venue Rental (₹{dailyPrice.toLocaleString()} x {totalDays} {totalDays > 1 ? 'days' : 'day'})</span>
                  <div className="flex-1 border-b border-dotted border-gray-200 mx-2 self-end mb-1 opacity-30"></div>
                  <span className="font-bold text-gray-900">₹{venueRental.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-50 group">
                  <span className="text-gray-700 font-medium whitespace-nowrap">Platform Fee (one-time)</span>
                  <div className="flex-1 border-b border-dotted border-gray-200 mx-2 self-end mb-1 opacity-30"></div>
                  <span className="font-bold text-gray-900">₹{platformFee.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-50 group">
                  <span className="text-gray-700 font-medium whitespace-nowrap">Taxes</span>
                  <div className="flex-1 border-b border-dotted border-gray-200 mx-2 self-end mb-1 opacity-30"></div>
                  <span className="font-bold text-gray-900">₹{taxAmount.toLocaleString()}</span>
                </div>
              
              {selectedServices.map((s: any) => {
                const isCatering = s.serviceType === "Catering" || s.id === "catering";
                const p = isCatering ? guestsCount * (s.price || s.avgPrice) : (s.price || s.avgPrice);
                return (
                  <div key={s._id || s.id} className="flex justify-between items-center py-2 border-b border-gray-50 group">
                    <div className="flex flex-col flex-grow">
                      <span className="text-gray-700 font-medium block whitespace-nowrap">{s.name}</span>
                      {isCatering && <span className="text-[10px] text-gray-400 font-bold italic">{guestsCount} guests × ₹{(s.price || s.avgPrice).toLocaleString()}</span>}
                    </div>
                    <div className="flex-1 border-b border-dotted border-gray-100 mx-2 self-end mb-1 opacity-20"></div>
                    <span className="font-bold text-gray-900">₹{p.toLocaleString()}</span>
                  </div>
                );
              })}

              {eventManager && (
                <div className="flex justify-between items-center py-2 border-b border-gray-50 group">
                  <div className="flex flex-col flex-grow">
                    <span className="text-gray-700 font-medium block whitespace-nowrap">Professional Event Manager</span>
                    <span className="text-[10px] text-gray-400 font-bold italic">Coordination & Support</span>
                  </div>
                  <div className="flex-1 border-b border-dotted border-gray-100 mx-2 self-end mb-1 opacity-20"></div>
                  <span className="font-bold text-gray-900">₹{EVENT_MANAGER_FEE.toLocaleString()}</span>
                </div>
              )}


              <div className="pt-4 flex justify-between items-center">
                <span className="text-xl font-black text-gray-900">Total Amount</span>
                <span className="text-3xl font-black text-primary-600">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* 4. Payment Preparation */}
          <section className="bg-white rounded-2xl shadow-xl border-2 border-primary-500/20 p-6 bg-gradient-to-br from-white to-primary-50/10">
            <h2 className="text-xl font-bold mb-4 text-primary-900">Confirm & Pay</h2>
            <p className="text-sm text-gray-600 mb-6">
              A minimum advance payment of 50% (capped at ₹50,000) is required to secure your booking.
            </p>

            <div className="space-y-4">
              <label className="block">
                <span className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-tight">Advance Amount to Pay</span>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-gray-400">₹</span>
                  <input
                    type="number"
                    value={advance}
                    onChange={(e) => handleAdvanceChange(e.target.value)}
                    className={`block w-full pl-10 pr-4 py-4 rounded-xl border-2 text-2xl font-black focus:outline-none transition-all ${
                      advanceError ? "border-red-500 bg-red-50" : "border-primary-100 focus:border-primary-500"
                    }`}
                    placeholder={minAdvance.toLocaleString()}
                  />
                </div>
                {advanceError && <p className="text-xs text-red-600 mt-2 font-bold">{advanceError}</p>}
                <p className="text-xs text-gray-400 mt-2 font-medium">
                  Min: ₹{minAdvance.toLocaleString()} • Max: ₹{maxAdvance.toLocaleString()}
                </p>
              </label>

              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold">
                  ⚠️ {submitError}
                </div>
              )}

              <div className="pt-4 space-y-3">
                <button
                  onClick={handleConfirmAndPay}
                  disabled={submitting}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-2xl text-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </>
                  ) : (
                    "Confirm & Pay Advance"
                  )}
                </button>
                <button
                  onClick={() => router.back()}
                  disabled={submitting}
                  className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all text-sm"
                >
                  Back to Edit Details
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReviewBookingPage;
