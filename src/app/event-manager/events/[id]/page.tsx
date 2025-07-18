"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_planning', label: 'In Planning' },
  { value: 'finalized', label: 'Finalized' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

async function fetchEvent(id) {
  const res = await fetch(`/api/event-manager/plan-events/${id}`);
  return res.json();
}
async function updateChecklist(id, checklist) {
  await fetch(`/api/event-manager/plan-events/${id}/checklist`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checklist }),
  });
}
async function updateStatus(id, status) {
  await fetch(`/api/event-manager/plan-events/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export default function EventManagerEventDetails() {
  const params = useParams();
  const { id } = params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [checklistUpdating, setChecklistUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchEvent(id);
      setEvent(data.event);
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  const handleToggleTask = async (idx) => {
    if (!event) return;
    setChecklistUpdating(true);
    const updated = event.checklist.map((task, i) =>
      i === idx ? { ...task, completed: !task.completed } : task
    );
    await updateChecklist(id, updated);
    setEvent({ ...event, checklist: updated });
    setChecklistUpdating(false);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setChecklistUpdating(true);
    const updated = [
      ...((event && event.checklist) || []),
      { label: newTask, completed: false, createdAt: new Date().toISOString() },
    ];
    await updateChecklist(id, updated);
    setEvent({ ...event, checklist: updated });
    setNewTask('');
    setChecklistUpdating(false);
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatusUpdating(true);
    await updateStatus(id, newStatus);
    setEvent({ ...event, status: newStatus });
    setStatusUpdating(false);
  };

  if (loading) return <div className="p-8">Loading event details...</div>;
  if (!event) return <div className="p-8 text-red-600">Event not found or you do not have access.</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Event Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div><b>Event Type:</b> {event.eventType}</div>
        <div><b>City:</b> {event.city}</div>
        <div><b>Date:</b> {event.date}</div>
        <div><b>Guests:</b> {event.guests}</div>
        <div><b>Budget:</b> {event.budget}</div>
        <div><b>Venue Type:</b> {event.venueType}</div>
        <div><b>Services:</b> {Array.isArray(event.services) ? event.services.join(', ') : ''}</div>
        <div><b>Theme:</b> {event.theme || '-'}</div>
        <div><b>Special Requests:</b> {event.special || '-'}</div>
        <div><b>Preferred Contact Time:</b> {event.contactTime || '-'}</div>
        <div><b>Event Tag:</b> {event.eventTag || '-'}</div>
        <div><b>Status:</b> {statusUpdating ? 'Updating...' : STATUS_OPTIONS.find(opt => opt.value === event.status)?.label || '-'}</div>
        <div><b>Created At:</b> {event.createdAt ? new Date(event.createdAt).toLocaleString() : '-'}</div>
      </div>
      {/* Communication Panels */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Communication Panel */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">User Communication</h2>
          <div><b>Name:</b> {event.userName || 'N/A'}</div>
          <div><b>Email:</b> {event.userEmail || 'N/A'}</div>
          <div><b>Phone:</b> {event.userPhone || 'N/A'}</div>
          <button className="mt-3 bg-blue-600 text-white px-4 py-1 rounded" disabled>Send Update (Coming soon)</button>
        </div>
        {/* Vendor Communication Panel */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Vendor Communication</h2>
          <div className="text-gray-500 mb-2">(Vendor integration coming soon)</div>
          <ul className="space-y-2">
            <li className="border-b pb-2"><b>Vendor:</b> Example Decorator<br /><b>Contact:</b> 9876543210</li>
            <li className="border-b pb-2"><b>Vendor:</b> Example Caterer<br /><b>Contact:</b> 9123456780</li>
          </ul>
          <button className="mt-3 bg-blue-600 text-white px-4 py-1 rounded" disabled>Message Vendor (Coming soon)</button>
        </div>
      </div>
      {/* Checklist & Status */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Checklist & Task Tracker</h2>
        <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="border px-2 py-1 rounded w-full"
            disabled={checklistUpdating}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={checklistUpdating}>Add</button>
        </form>
        <ul className="space-y-2">
          {(event.checklist || []).map((task, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(idx)}
                disabled={checklistUpdating}
              />
              <span className={task.completed ? 'line-through text-gray-400' : ''}>{task.label}</span>
              {task.dueDate && <span className="ml-2 text-xs text-gray-500">(Due: {new Date(task.dueDate).toLocaleDateString()})</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Status Update</h2>
        <select
          value={event.status}
          onChange={handleStatusChange}
          className="border px-2 py-1 rounded"
          disabled={statusUpdating}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
} 