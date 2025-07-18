'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function HelpPage() {
  const { data: session } = useSession();
  const [supportMessage, setSupportMessage] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportSuccess, setSupportSuccess] = useState('');
  const [supportError, setSupportError] = useState('');
  const [loading, setLoading] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSupportSuccess('');
    setSupportError('');
    setLoading(true);
    if (!session) {
      setSupportError('You must be signed in to contact support.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: supportSubject, message: supportMessage }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSupportSuccess('Your message has been sent! Our team will contact you soon.');
        setSupportMessage('');
        setSupportSubject('');
        setSupportEmail('');
      } else {
        setSupportError(data.error || 'Failed to send message. Please try again later.');
      }
    } catch (err) {
      setSupportError('Failed to send message. Please try again later.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 pb-16">
      {/* Hero Section */}
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center py-10 px-4">
        <div className="flex items-center justify-center mb-4">
          <Image src="/phone-call.png" alt="Support" width={56} height={56} className="drop-shadow-lg" />
        </div>
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2">Help & Support</h1>
        <p className="text-lg text-gray-700 mb-4">We're here to help you have a smooth and memorable event experience. Browse FAQs, guides, or contact our friendly team!</p>
      </div>

      <div className="max-w-3xl mx-auto grid gap-8 px-4">
        {/* FAQs */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><span>❓</span> Frequently Asked Questions</h2>
          <ul className="space-y-3 text-gray-800">
            <li><b>How do I book a hall?</b> <br />Go to the Halls page, select your preferred hall, and click "Book Now".</li>
            <li><b>How do I cancel or reschedule a booking?</b> <br />Go to your Profile, find your booking, and use the Cancel or Reschedule button.</li>
            <li><b>What payment methods are accepted?</b> <br />We accept credit/debit cards, UPI, and net banking.</li>
            <li><b>How do I contact the hall owner?</b> <br />You can message the owner from the hall details page or your bookings list.</li>
            <li><b>What is the refund policy?</b> <br />Refunds are processed as per our <a href="#policies" className="text-primary-600 underline">cancellation policy</a>.</li>
          </ul>
        </section>

        {/* Contact Support */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><span>📞</span> Contact Support</h2>
          {!session && (
            <div className="mb-4 text-red-600 font-semibold">You must be signed in to contact support.</div>
          )}
          <form className="space-y-4" onSubmit={handleSupportSubmit}>
            <div>
              <label className="block text-sm font-medium">Subject</label>
              <input
                className="input-field mt-1"
                type="text"
                value={supportSubject}
                onChange={e => setSupportSubject(e.target.value)}
                required
                placeholder="Subject of your request"
                disabled={!session}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Message</label>
              <textarea
                className="input-field mt-1"
                value={supportMessage}
                onChange={e => setSupportMessage(e.target.value)}
                required
                placeholder="How can we help you?"
                rows={4}
                disabled={!session}
              />
            </div>
            {supportError && <div className="text-red-600 text-sm">{supportError}</div>}
            {supportSuccess && <div className="text-green-600 text-sm">{supportSuccess}</div>}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow transition" type="submit" disabled={loading || !session}>{loading ? 'Sending...' : 'Send Message'}</button>
          </form>
          <div className="mt-4 text-gray-600 text-sm">
            Or email us at <a href="mailto:support@eventhall.com" className="text-primary-600 underline">support@eventhall.com</a>
          </div>
        </section>

        {/* Booking Guide */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><span>📝</span> Booking Guide</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-800">
            <li>Create an account or sign in.</li>
            <li>Browse available halls and select your preferred venue.</li>
            <li>Choose your dates, add services, and complete the booking form.</li>
            <li>Make payment and receive confirmation.</li>
            <li>Manage your bookings from your profile.</li>
          </ol>
        </section>

        {/* Policies */}
        <section className="bg-white rounded-xl shadow p-6" id="policies">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><span>📋</span> Policies</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-800">
            <li><b>Cancellation:</b> Bookings can be cancelled up to 7 days before the event for a full refund.</li>
            <li><b>Privacy:</b> Your data is secure and will not be shared without consent.</li>
            <li><b>Terms of Service:</b> Please read our terms before booking.</li>
          </ul>
        </section>

        {/* Troubleshooting */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><span>🛠️</span> Troubleshooting</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-800">
            <li>Can't log in? Try resetting your password or contact support.</li>
            <li>Didn't receive a confirmation email? Check your spam folder or contact us.</li>
            <li>Payment issues? Ensure your payment details are correct or try another method.</li>
          </ul>
        </section>

        {/* Feedback */}
        <section className="bg-white rounded-xl shadow p-6 text-center">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 justify-center"><span>💡</span> Feedback</h2>
          <p className="mb-2">We value your feedback! Please let us know how we can improve your experience by contacting support or using the feedback form above.</p>
          <a href="mailto:feedback@weenyou.com" className="inline-block mt-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2 rounded-full shadow transition">Send Feedback</a>
        </section>
      </div>
    </div>
  );
} 