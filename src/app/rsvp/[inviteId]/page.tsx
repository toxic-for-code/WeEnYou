'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function RSVPPage({ params }: { params: { inviteId: string } }) {
  const searchParams = useSearchParams();
  const [response, setResponse] = useState('Yes');
  const [guestEmail, setGuestEmail] = useState(searchParams.get('email') || '');
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventDate = searchParams.get('eventDate') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteId: params.inviteId,
          guestEmail,
          response,
          guestCount,
          specialRequests,
          eventDate,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit RSVP.');
      }
    } catch (err) {
      setError('Failed to submit RSVP.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 py-16">
        <div className="bg-white p-8 rounded-lg shadow border border-blue-100 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Thank you for your RSVP!</h1>
          <p className="text-gray-700">We look forward to seeing you at the event.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 py-16">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow border border-blue-100 max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">RSVP</h1>
        <input type="hidden" name="eventDate" value={eventDate} />
        <div className="mb-4">
          <label className="block font-semibold mb-1">Your Email</label>
          <input type="email" className="w-full border rounded px-3 py-2" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Will you attend?</label>
          <select className="w-full border rounded px-3 py-2" value={response} onChange={e => setResponse(e.target.value)}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Maybe">Maybe</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Number of Guests</label>
          <input type="number" min={1} className="w-full border rounded px-3 py-2" value={guestCount} onChange={e => setGuestCount(Number(e.target.value))} />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Special Requests</label>
          <textarea className="w-full border rounded px-3 py-2" value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="Let us know if you have any dietary restrictions, accessibility needs, etc." />
        </div>
        <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit RSVP'}</button>
        {error && <div className="mt-2 text-red-600 text-center">{error}</div>}
      </form>
    </div>
  );
} 