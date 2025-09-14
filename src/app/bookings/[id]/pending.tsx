import React from 'react';

export default function BookingPending() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Booking Request Sent!</h1>
      <p className="text-lg text-gray-700 mb-6 text-center">
        Thank you for your payment.<br />
        Please wait for the owner to accept your request.<br />
        You’ll be notified once it’s accepted.
      </p>
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-b-4 border-gray-200 mb-4"></div>
      <span className="text-gray-400 text-sm">You can close this page and check your booking status in your dashboard at any time.</span>
    </div>
  );
} 