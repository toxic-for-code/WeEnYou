import React from 'react';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function BookingPending() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 px-4 py-12">
      <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-10 text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
        
        {/* Success Icon */}
        <div className="mb-6 text-green-500 bg-green-50 p-4 rounded-full">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight">
          Booking Request Sent!
        </h1>

        {/* Confirmation Message */}
        <p className="text-gray-600 font-medium text-lg mb-6 leading-relaxed">
          Thank you for your payment. Your booking request has been successfully submitted.
        </p>

        {/* Info Box */}
        <div className="w-full bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8">
          <p className="text-blue-800 text-sm font-bold leading-relaxed">
            📢 What happens next?
          </p>
          <p className="text-blue-700 text-xs mt-2 leading-relaxed">
            The venue owner will review your request. You'll receive a notification and an email once it's approved. You can track the status in your dashboard.
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full space-y-4">
          <Link href="/profile" className="block w-full">
            <button className="w-full bg-[#111111] hover:bg-black text-white font-extrabold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-gray-900/10 active:scale-95 text-lg">
              Go to Dashboard
            </button>
          </Link>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            Always accessible in your profile
          </p>
        </div>
      </div>

      {/* Footer Support Link */}
      <div className="mt-8">
        <Link href="/help" className="text-gray-500 hover:text-gray-900 text-sm font-semibold underline decoration-gray-300 underline-offset-4 transition-all">
          Need help? Contact support
        </Link>
      </div>
    </div>
  );
}