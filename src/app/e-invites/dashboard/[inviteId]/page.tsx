'use client';
import React, { useEffect, useState } from 'react';

interface RSVP {
  guestEmail: string;
  response: string;
  guestCount?: number;
  specialRequests?: string;
  respondedAt: string;
}

export default function InviteDashboardPage({ params }: { params: { inviteId: string } }) {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRsvps() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/rsvp?inviteId=${params.inviteId}`);
        if (res.ok) {
          const data = await res.json();
          setRsvps(data.rsvps || []);
        } else {
          setError('Failed to fetch RSVP responses.');
        }
      } catch (err) {
        setError('Failed to fetch RSVP responses.');
      } finally {
        setLoading(false);
      }
    }
    fetchRsvps();
  }, [params.inviteId]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-16">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">RSVP Responses</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : rsvps.length === 0 ? (
        <div>No RSVP responses yet.</div>
      ) : (
        <div className="w-full max-w-3xl overflow-x-auto">
          <table className="min-w-full border border-blue-200 rounded-lg">
            <thead>
              <tr className="bg-blue-50">
                <th className="px-4 py-2 border-b">Guest Email</th>
                <th className="px-4 py-2 border-b">Response</th>
                <th className="px-4 py-2 border-b">Guest Count</th>
                <th className="px-4 py-2 border-b">Special Requests</th>
                <th className="px-4 py-2 border-b">Responded At</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((rsvp, idx) => (
                <tr key={idx} className="text-center">
                  <td className="px-4 py-2 border-b">{rsvp.guestEmail}</td>
                  <td className="px-4 py-2 border-b">{rsvp.response}</td>
                  <td className="px-4 py-2 border-b">{rsvp.guestCount || '-'}</td>
                  <td className="px-4 py-2 border-b">{rsvp.specialRequests || '-'}</td>
                  <td className="px-4 py-2 border-b">{new Date(rsvp.respondedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 