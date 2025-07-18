"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const ConfirmationPage = () => {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) throw new Error("Failed to fetch booking");
        const data = await res.json();
        setBooking(data.booking);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    if (bookingId) fetchBooking();
  }, [bookingId]);

  // Confetti animation on booking confirmation
  useEffect(() => {
    if (booking && booking.paymentStatus === "paid") {
      import('canvas-confetti').then((module) => {
        const confetti = module.default;
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      });
    }
  }, [booking?.paymentStatus]);

  const handlePayNow = async () => {
    setPaying(true);
    setError("");
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay SDK");
      // Call backend to create order
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount: booking.totalPrice,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create payment order");
      }
      const { order } = await res.json();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: booking.hallId?.name,
        description: `Booking for ${booking.hallId?.name}`,
        order_id: order.id,
        handler: async function (response: any) {
          // Optionally, call backend to verify payment and update booking
          // For now, reload page to show updated status
          window.location.reload();
        },
        prefill: {
          name: booking.userId?.name,
          email: booking.userId?.email,
        },
        notes: order.notes,
        theme: { color: "#3399cc" },
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]">Loading...</div>;
  }
  if (error) {
    return <div className="flex justify-center items-center min-h-[60vh] text-red-600">{error}</div>;
  }
  if (!booking) {
    return <div className="flex justify-center items-center min-h-[60vh] text-gray-600">Booking not found.</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-4 text-green-700 flex items-center gap-2">🎉 Booking Confirmed!</h1>
      <div className="mb-4">
        <div className="text-lg font-semibold">Venue:</div>
        <div>{booking.hallId?.name}</div>
        <div className="text-sm text-gray-500">{booking.hallId?.location?.address}, {booking.hallId?.location?.city}, {booking.hallId?.location?.state}</div>
      </div>
      <div className="mb-2">📅 <b>Date:</b> {new Date(booking.startDate).toLocaleDateString()} {booking.startTime && (", " + booking.startTime)}</div>
      <div className="mb-2">👥 <b>Guests:</b> {booking.guests}</div>
      <div className="mb-2">💬 <b>Special Requests:</b> {booking.specialRequests || "-"}</div>
      <div className="mb-2">💰 <b>Total Price:</b> ₹{booking.totalPrice?.toLocaleString()}</div>
      <div className="mb-4">Status: <span className={`font-semibold ${booking.paymentStatus === "paid" ? "text-green-600" : "text-orange-600"}`}>{booking.paymentStatus === "paid" ? "Paid" : "Pending Payment"}</span></div>
      {booking.paymentStatus !== "paid" && (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-lg shadow transition disabled:opacity-60"
          onClick={handlePayNow}
          disabled={paying}
        >
          {paying ? "Processing..." : "Pay Now"}
        </button>
      )}
      {booking.paymentStatus === "paid" && (
        <div className="mt-4 text-green-700 font-semibold">Thank you for your payment! You will receive a confirmation email shortly.</div>
      )}
    </div>
  );
};

export default ConfirmationPage; 