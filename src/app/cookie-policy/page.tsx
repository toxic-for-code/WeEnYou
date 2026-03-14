import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | WeEnYou',
  description: 'Learn how WeEnYou uses cookies and similar technologies to improve your experience on our event planning platform.',
};

export default function CookiePolicyPage() {
  return (
    <div className="page-mobile-first min-h-screen bg-gray-50 flex items-start justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6">
      <div className="bg-white max-w-[900px] w-full min-w-0 rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 md:p-10 lg:p-12">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Cookie Policy</h1>
        <div className="text-sm text-gray-500 font-medium text-right mb-6">Last updated: <span className="font-semibold">March 2026</span></div>

        <p className="text-gray-700 text-base mb-4">This Cookie Policy explains how WeEnYou uses cookies and similar technologies when you visit our website.</p>
        <p className="text-gray-700 text-base mb-6">By continuing to use our website, you agree to the use of cookies as described in this policy.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">1. What Are Cookies</h2>
        <p className="mb-4 text-gray-700">Cookies are small text files that are stored on your device when you visit a website. They help websites remember information about your visit, such as your preferences, login status, and browsing behavior.</p>
        <p className="mb-6 text-gray-700">Cookies help improve the performance and usability of the website.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">2. How We Use Cookies</h2>
        <p className="mb-2 text-gray-700">WeEnYou uses cookies to:</p>
        <ul className="list-disc list-inside mb-6 text-gray-700 space-y-1">
          <li>Ensure the website functions properly</li>
          <li>Improve user experience</li>
          <li>Remember user preferences</li>
          <li>Analyze website traffic and performance</li>
          <li>Enable secure login sessions</li>
        </ul>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">3. Types of Cookies We Use</h2>
        <h3 className="text-base font-semibold text-gray-800 mt-4 mb-1">Essential Cookies</h3>
        <p className="mb-4 text-gray-700">These cookies are necessary for the website to function correctly. Without them, certain features such as login or booking services may not work.</p>
        <h3 className="text-base font-semibold text-gray-800 mt-4 mb-1">Performance Cookies</h3>
        <p className="mb-4 text-gray-700">These cookies collect anonymous information about how visitors use the website. They help us understand which pages are most visited and improve the performance of the platform.</p>
        <h3 className="text-base font-semibold text-gray-800 mt-4 mb-1">Functional Cookies</h3>
        <p className="mb-4 text-gray-700">These cookies allow the website to remember choices you make, such as language preferences or saved information.</p>
        <h3 className="text-base font-semibold text-gray-800 mt-4 mb-1">Analytics Cookies</h3>
        <p className="mb-6 text-gray-700">We may use analytics tools to understand how users interact with the website. This helps us improve the platform and user experience.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">4. Third-Party Cookies</h2>
        <p className="mb-4 text-gray-700">Some cookies may be set by third-party services integrated into the website, such as analytics providers or payment processors.</p>
        <p className="mb-6 text-gray-700">These third parties may collect information in accordance with their own privacy policies.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">5. Managing Cookies</h2>
        <p className="mb-4 text-gray-700">Most web browsers allow you to control cookies through browser settings. You can choose to block or delete cookies at any time.</p>
        <p className="mb-6 text-gray-700">Please note that disabling cookies may affect the functionality of some parts of the website.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">6. Updates to This Policy</h2>
        <p className="mb-6 text-gray-700">WeEnYou may update this Cookie Policy from time to time to reflect changes in technology or legal requirements. Updated versions will be posted on this page.</p>
        <hr className="my-6 border-gray-200" />

        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">7. Contact Us</h2>
        <p className="mb-2 text-gray-700">If you have any questions about our Cookie Policy, you can contact us:</p>
        <p className="mb-2 text-gray-700">Email: <a href="mailto:support@weenyou.com" className="text-blue-600 underline font-semibold">support@weenyou.com</a></p>
        <p className="mb-6 text-gray-700">Website: <a href="https://weenyou.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">https://weenyou.com</a></p>
      </div>
    </div>
  );
}
