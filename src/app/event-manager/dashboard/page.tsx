"use client";
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

async function fetchAssignedEvents() {
  const res = await fetch('/api/event-manager/plan-events');
  return res.json();
}

export default function EventManagerDashboard() {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchAssignedEvents();
      setEvents(data.events || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="p-8">Loading your assigned events...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Assigned Events</h1>
      {events.length === 0 ? (
        <div>No events assigned to you yet.</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2 border">Event Type</th>
              <th className="p-2 border">City</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Guests</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Details</th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev._id}>
                <td className="p-2 border">{ev.eventType}</td>
                <td className="p-2 border">{ev.city}</td>
                <td className="p-2 border">{ev.date}</td>
                <td className="p-2 border">{ev.guests}</td>
                <td className="p-2 border">{ev.status || '-'}</td>
                <td className="p-2 border text-center">
                  <a href={`/event-manager/events/${ev._id}`} className="text-blue-600 underline">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 