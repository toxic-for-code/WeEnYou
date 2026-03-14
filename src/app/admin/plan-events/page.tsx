'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BriefcaseIcon, 
  MapPinIcon, 
  CalendarIcon, 
  UserIcon, 
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  IdentificationIcon,
  BanknotesIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Helper functions for API calls
async function fetchPlanEvents() {
  const res = await fetch('/api/admin/plan-events');
  return res.json();
}

async function fetchEventManagers() {
  const res = await fetch('/api/admin/users?role=event_manager');
  return res.json();
}

async function assignEventManager(eventId: string, managerId: string) {
  await fetch(`/api/admin/plan-events/${eventId}/assign-manager`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_manager_id: managerId }),
  });
}

export default function AdminPlanEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [eventData, managerData] = await Promise.all([
          fetchPlanEvents(),
          fetchEventManagers(),
        ]);
        setEvents(eventData.events || []);
        setManagers(managerData.users || []);
      } catch (error) {
        console.error('Error loading planned events:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleAssign = async (eventId: string, managerId: string) => {
    setAssigning(eventId);
    try {
      await assignEventManager(eventId, managerId);
      setEvents(events.map(ev => ev._id === eventId ? { ...ev, event_manager_id: managerId } : ev));
    } catch (error) {
      console.error('Error assigning manager:', error);
    } finally {
      setAssigning(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89B3C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planned Events</h1>
          <p className="text-gray-500 text-sm mt-1">Review event requests and assign dedicated managers for coordination.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Event Details</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Location & Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Client Information</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Event Manager</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((ev) => (
                <React.Fragment key={ev._id}>
                  <tr className={`hover:bg-gray-50/50 transition-colors ${expanded === ev._id ? 'bg-gray-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                            <BriefcaseIcon className="w-5 h-5 text-[#C89B3C]" />
                         </div>
                         <div>
                            <p className="font-bold text-gray-900 leading-none capitalize">{ev.eventType}</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">{ev.eventTag || 'Standard'}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium truncate max-w-[120px]">{ev.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-medium">{ev.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                           <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                           <p className="truncate max-w-[140px] leading-tight">{ev.userName || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <a href={`mailto:${ev.userEmail}`} className="text-gray-400 hover:text-[#C89B3C]"><EnvelopeIcon className="w-3.5 h-3.5" /></a>
                           <a href={`tel:${ev.userPhone}`} className="text-gray-400 hover:text-[#C89B3C]"><DevicePhoneMobileIcon className="w-3.5 h-3.5" /></a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative group">
                        <select
                          value={ev.event_manager_id || ''}
                          onChange={(e) => handleAssign(ev._id, e.target.value)}
                          disabled={assigning === ev._id}
                          className={`appearance-none w-full pl-3 pr-8 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border-0 ${
                            ev.event_manager_id 
                               ? 'bg-blue-50 text-blue-600 focus:ring-2 focus:ring-blue-100' 
                               : 'bg-amber-50 text-amber-600 focus:ring-2 focus:ring-amber-100'
                          }`}
                        >
                          <option value="">Unassigned</option>
                          {managers.map((m) => (
                            <option key={m._id} value={m._id}>{m.name}</option>
                          ))}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-current pointer-events-none opacity-50" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleExpand(ev._id)}
                        className={`p-2 rounded-xl transition-all ${
                          expanded === ev._id ? 'bg-[#C89B3C] text-white' : 'bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {expanded === ev._id ? <ChevronUpIcon className="w-5 h-5" /> : <InformationCircleIcon className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                  {expanded === ev._id && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={5} className="px-6 py-8 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <SparklesIcon className="w-3 h-3" />
                                Event Specs
                              </h4>
                              <div className="space-y-3">
                                 <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                       <UserGroupIcon className="w-3 h-3 text-gray-400" />
                                       <span className="text-[10px] font-bold text-gray-400">GUESTS</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">{ev.guests}</p>
                                 </div>
                                 <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                       <BanknotesIcon className="w-3 h-3 text-gray-400" />
                                       <span className="text-[10px] font-bold text-gray-400">BUDGET</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">₹{ev.budget}</p>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="space-y-4 lg:col-span-2">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <InformationCircleIcon className="w-3 h-3" />
                                Detailed Requirements
                              </h4>
                              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                                 <div className="grid grid-cols-2 gap-4">
                                    <div>
                                       <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">Venue Type</p>
                                       <p className="text-xs font-bold text-gray-900">{ev.venueType}</p>
                                    </div>
                                    <div>
                                       <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">Theme</p>
                                       <p className="text-xs font-bold text-gray-900">{ev.theme || 'Not Specified'}</p>
                                    </div>
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">Services Required</p>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                       {Array.isArray(ev.services) ? ev.services.map((s, idx) => (
                                          <span key={idx} className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-600">{s}</span>
                                       )) : <span className="text-xs font-medium text-gray-400 italic">None selected</span>}
                                    </div>
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">Special Requests</p>
                                    <p className="text-xs font-medium text-gray-600 leading-relaxed italic">"{ev.special || 'No special requests provided.'}"</p>
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <IdentificationIcon className="w-3 h-3" />
                                Metadata
                              </h4>
                              <div className="space-y-2">
                                 <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-gray-400 font-bold">CONTACT TIME</span>
                                    <span className="text-gray-900 font-bold">{ev.contactTime || 'Anytime'}</span>
                                 </div>
                                 <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-gray-400 font-bold">SUBMITTED</span>
                                    <span className="text-gray-900 font-bold">{ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : 'N/A'}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {events.length === 0 && (
            <div className="text-center py-20">
               <BriefcaseIcon className="w-12 h-12 text-gray-200 mx-auto" />
               <p className="text-gray-400 font-medium mt-4">No planned events found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}