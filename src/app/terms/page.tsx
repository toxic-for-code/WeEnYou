import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-2">
      <div className="bg-white max-w-4xl w-full rounded-xl shadow-lg border border-gray-200 p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 mb-2">📄 WeEnYou Terms & Conditions</h1>
        <div className="text-sm text-gray-500 font-medium text-right mb-6">Last Updated: <span className="font-semibold">13 July 2025</span></div>
        <p className="text-gray-700 text-base mb-6">Welcome to WeEnYou! By accessing or using our website, mobile app, or services, you agree to be bound by these Terms and Conditions. Please read them carefully before using our platform.<br /><br />These Terms apply to all users of WeEnYou, including customers, vendors, venue owners, and visitors.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">🏢 1. About WeEnYou</h2>
        <p className="mb-6 text-gray-700">WeEnYou is a digital event planning platform operated independently by its founding team. It helps users discover, compare, and book venues and services such as decorators, caterers, and photographers for weddings, birthdays, corporate events, and more.<br /><br />We act as a facilitator between customers and service providers but do not own or operate any venues or event services directly.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">👥 2. User Responsibilities</h2>
        <p className="mb-2 text-gray-700">By using WeEnYou, you agree to:</p>
        <ul className="list-disc list-inside mb-2 text-gray-700 space-y-1">
          <li>Provide accurate and honest personal information</li>
          <li>Use the platform only for lawful purposes</li>
          <li>Refrain from spamming, misusing, or attempting to harm the platform or its users</li>
          <li>Maintain the confidentiality of your login credentials</li>
          <li>Respect service providers, venues, and WeEnYou representatives in all interactions</li>
        </ul>
        <p className="mb-6 text-gray-700">We reserve the right to suspend or terminate accounts that violate these responsibilities.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">🏷️ 3. Bookings and Payments</h2>
        <ul className="list-disc list-inside mb-2 text-gray-700 space-y-1">
          <li>Bookings made through WeEnYou are binding agreements between the user and the vendor or venue</li>
          <li>All payments are processed securely through third-party gateways (e.g., Razorpay)</li>
          <li>WeEnYou may charge a platform service fee per confirmed booking (e.g., 10%)</li>
          <li>Payment confirmation does not guarantee vendor availability until the vendor/venue accepts the request</li>
          <li>Any changes or cancellations must follow our Cancellation & Refund Policy</li>
        </ul>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">🏛️ 4. Vendor & Venue Partner Terms</h2>
        <p className="mb-2 text-gray-700">Vendors and venue owners who list services on WeEnYou agree to:</p>
        <ul className="list-disc list-inside mb-2 text-gray-700 space-y-1">
          <li>Provide accurate and up-to-date information about their services</li>
          <li>Honor bookings unless canceled with valid prior notice</li>
          <li>Deliver quality service as described in their listing</li>
          <li>Respond promptly to user inquiries and confirmations</li>
        </ul>
        <p className="mb-6 text-gray-700">WeEnYou reserves the right to remove listings, suspend payouts, or terminate accounts that violate platform rules or receive repeated complaints.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">❌ 5. Cancellations and Refunds</h2>
        <p className="mb-2 text-gray-700">Cancellations and refunds are governed by our Cancellation & Refund Policy, which outlines the conditions for:</p>
        <ul className="list-disc list-inside mb-2 text-gray-700 space-y-1">
          <li>User-initiated cancellations</li>
          <li>Vendor-initiated cancellations</li>
          <li>Refund eligibility</li>
          <li>Platform service fee policies</li>
        </ul>
        <p className="mb-6 text-gray-700">Users are encouraged to review each vendor or venue’s cancellation terms before booking.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">🔐 6. Content Ownership and Usage</h2>
        <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
          <li>All content on the WeEnYou platform — including text, images, listings, logos, and branding — is owned by WeEnYou or its partners</li>
          <li>You may not reproduce, distribute, or commercially use platform content without written permission</li>
          <li>User-generated reviews, messages, or uploads must be respectful, non-abusive, and free from false claims</li>
        </ul>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">⚠️ 7. Limitation of Liability</h2>
        <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
          <li>WeEnYou does not guarantee the performance, quality, or reliability of any third-party venue or service</li>
          <li>We are not liable for delays, miscommunication, or service failures between users and vendors</li>
          <li>In disputes, WeEnYou may provide mediation but is not legally liable for final outcomes</li>
          <li>Platform availability may occasionally be affected by maintenance or technical issues</li>
        </ul>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">📝 8. Modifications to the Terms</h2>
        <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
          <li>WeEnYou reserves the right to update or modify these Terms at any time. Continued use of the platform after changes implies acceptance of the updated Terms.</li>
          <li>Major updates will be communicated via email or in-app notifications.</li>
        </ul>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">📩 9. Contact Us</h2>
        <p className="mb-2 text-gray-700">If you have any questions about these Terms & Conditions, contact our support team:</p>
        <ul className="list-disc list-inside mb-2 text-gray-700 space-y-1">
          <li>📧 Email: <a href="mailto:support@weenyou.com" className="text-blue-600 underline font-semibold">support@weenyou.com</a></li>
          <li>📞 Phone: +91-XXXXXXXXXX</li>
        </ul>
      </div>
    </div>
  );
} 