'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Fetch all planned events and all event managers
async function fetchPlanEvents() {
  const res = await fetch('/api/admin/plan-events');
  return res.json();
}
async function fetchEventManagers() {
  const res = await fetch('/api/admin/users?role=event_manager');
  return res.json();
}
async function assignEventManager(eventId, managerId) {
  await fetch(`/api/admin/plan-events/${eventId}/assign-manager`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_manager_id: managerId }),
  });
}

export default function AdminPlanEventsPage() {
  const [events, setEvents] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [eventData, managerData] = await Promise.all([
        fetchPlanEvents(),
        fetchEventManagers(),
      ]);
      setEvents(eventData.events || []);
      setManagers(managerData.users || []);
      setLoading(false);
    }
    load();
  }, []);

  const handleAssign = async (eventId, managerId) => {
    setAssigning(eventId);
    await assignEventManager(eventId, managerId);
    setEvents(events.map(ev => ev._id === eventId ? { ...ev, event_manager_id: managerId } : ev));
    setAssigning(null);
  };

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  if (loading) return <div className="p-8">Loading planned events...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Planned Events</h1>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Event Type</th>
            <th className="p-2 border">City</th>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">User Name</th>
            <th className="p-2 border">User Email</th>
            <th className="p-2 border">User Phone</th>
            <th className="p-2 border">Event Manager</th>
            <th className="p-2 border">Assign</th>
            <th className="p-2 border">Details</th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <React.Fragment key={ev._id}>
              <tr>
                <td className="p-2 border">{ev.eventType}</td>
                <td className="p-2 border">{ev.city}</td>
                <td className="p-2 border">{ev.date}</td>
                <td className="p-2 border">{ev.userName || '-'}</td>
                <td className="p-2 border">{ev.userEmail || '-'}</td>
                <td className="p-2 border">{ev.userPhone || '-'}</td>
                <td className="p-2 border">{managers.find(m => m._id === ev.event_manager_id)?.name || '-'}</td>
                <td className="p-2 border">
                  <select
                    value={ev.event_manager_id || ''}
                    onChange={e => handleAssign(ev._id, e.target.value)}
                    disabled={assigning === ev._id}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Assign...</option>
                    {managers.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2 border text-center">
                  <button
                    className="text-blue-600 underline cursor-pointer"
                    onClick={() => toggleExpand(ev._id)}
                  >
                    {expanded === ev._id ? 'Hide' : 'Show'}
                  </button>
                </td>
              </tr>
              {expanded === ev._id && (
                <tr>
                  <td colSpan={9} className="p-4 border bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><b>Event Type:</b> {ev.eventType}</div>
                      <div><b>City:</b> {ev.city}</div>
                      <div><b>Date:</b> {ev.date}</div>
                      <div><b>Guests:</b> {ev.guests}</div>
                      <div><b>Budget:</b> {ev.budget}</div>
                      <div><b>Venue Type:</b> {ev.venueType}</div>
                      <div><b>Services:</b> {Array.isArray(ev.services) ? ev.services.join(', ') : ''}</div>
                      <div><b>Theme:</b> {ev.theme || '-'}</div>
                      <div><b>Special Requests:</b> {ev.special || '-'}</div>
                      <div><b>Preferred Contact Time:</b> {ev.contactTime || '-'}</div>
                      <div><b>Event Tag:</b> {ev.eventTag || '-'}</div>
                      <div><b>User Name:</b> {ev.userName || '-'}</div>
                      <div><b>User Email:</b> {ev.userEmail || '-'}</div>
                      <div><b>User Phone:</b> {ev.userPhone || '-'}</div>
                      <div><b>Created At:</b> {ev.createdAt ? new Date(ev.createdAt).toLocaleString() : '-'}</div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
} 