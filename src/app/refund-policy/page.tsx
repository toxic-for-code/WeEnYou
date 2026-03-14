import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | WeEnYou',
  description: 'Learn about WeEnYou\'s refund and cancellation policy for event venue bookings.',
};

export default function RefundPolicyPage() {
  return (
    <div className="page-mobile-first min-h-screen bg-gray-50 flex items-start justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6">
      <div className="bg-white max-w-[900px] w-full min-w-0 rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-10 lg:p-12">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Refund & Cancellation Policy</h1>
        <div className="text-sm text-gray-500 font-medium text-right mb-6">Last updated: <span className="font-semibold">March 2026</span></div>

        <p className="text-gray-700 text-base mb-4">Welcome to WeEnYou. This Refund & Cancellation Policy explains how refunds, cancellations, and payment adjustments are handled when users book venues or services through our platform.</p>
        <p className="text-gray-700 text-base mb-6">By using WeEnYou and making a booking, you agree to the terms outlined below.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">1. Platform Role</h2>
        <p className="mb-4 text-gray-700">WeEnYou acts as a platform connecting users with venue owners and event vendors. We do not own or operate the venues listed on our platform. Payments made through WeEnYou are processed securely via third-party payment gateways.</p>
        <p className="mb-6 text-gray-700">Because venues are managed by independent partners, refund and cancellation terms may vary depending on the venue or vendor.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">2. Booking Confirmation</h2>
        <p className="mb-2 text-gray-700">A booking is considered confirmed once payment has been successfully processed through the platform and a confirmation is provided to the user.</p>
        <p className="mb-2 text-gray-700">Users should review all booking details including:</p>
        <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
          <li>Venue name</li>
          <li>Event date</li>
          <li>Pricing and applicable charges</li>
          <li>Venue-specific policies</li>
        </ul>
        <p className="mb-6 text-gray-700">before completing payment.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">3. Cancellation by User</h2>
        <p className="mb-2 text-gray-700">Users may request cancellation of their booking. Refund eligibility depends on the timing of the cancellation and the venue partner&apos;s policy.</p>
        <p className="mb-2 text-gray-700">Typical guidelines may include:</p>
        <ul className="list-disc list-inside mb-2 text-gray-700 space-y-1">
          <li><strong>More than 30 days before the event</strong> — Eligible for partial or full refund depending on venue policy.</li>
          <li><strong>7–30 days before the event</strong> — Partial refund may apply.</li>
          <li><strong>Less than 7 days before the event</strong> — Cancellation may not be eligible for a refund.</li>
        </ul>
        <p className="mb-6 text-gray-700">Actual refund eligibility may vary depending on the venue or vendor&apos;s individual cancellation policy.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">4. Cancellation by Venue or Vendor</h2>
        <p className="mb-2 text-gray-700">In rare cases where the venue or vendor cancels the booking due to unforeseen circumstances:</p>
        <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
          <li>Users will be notified immediately</li>
          <li>WeEnYou will assist in finding an alternative venue</li>
          <li>If no suitable alternative is accepted, a full refund of the booking amount may be issued</li>
        </ul>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">5. Non-Refundable Charges</h2>
        <p className="mb-2 text-gray-700">Certain fees may be non-refundable including:</p>
        <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
          <li>Platform service fees</li>
          <li>Payment gateway processing charges</li>
          <li>Custom vendor services already rendered</li>
        </ul>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">6. Refund Processing Time</h2>
        <p className="mb-2 text-gray-700">Once a refund request is approved:</p>
        <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
          <li>Refunds are typically processed within <strong>5–10 business days</strong></li>
          <li>The refunded amount will be credited to the <strong>original payment method</strong></li>
        </ul>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">7. No-Show Policy</h2>
        <p className="mb-6 text-gray-700">If a user fails to appear at the venue on the scheduled event date without prior cancellation, the booking may be treated as a no-show and refunds may not apply.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">8. Disputes</h2>
        <p className="mb-6 text-gray-700">In case of disputes between users and venue partners, WeEnYou will attempt to mediate and assist in resolving the issue fairly.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">9. Contact Us</h2>
        <p className="mb-2 text-gray-700">Email: <a href="mailto:support@weenyou.com" className="text-blue-600 underline font-semibold">support@weenyou.com</a></p>
        <p className="mb-6 text-gray-700">Website: <a href="https://weenyou.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">https://weenyou.com</a></p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">10. Policy Updates</h2>
        <p className="mb-6 text-gray-700">WeEnYou reserves the right to modify this Refund & Cancellation Policy at any time.</p>
      </div>
    </div>
  );
}
