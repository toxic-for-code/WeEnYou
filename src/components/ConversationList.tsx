'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Conversation {
  _id: string;
  participants: { _id: string; name: string; role: string }[];
  lastMessage?: { content: string; createdAt: string };
  conversationType: string;
  bookingId?: string;
  serviceId?: string;
}

export default function ConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const { data: session } = useSession();
  const [bookingIds, setBookingIds] = useState<string[]>([]);
  const [serviceBookingMeta, setServiceBookingMeta] = useState<{ serviceId: string; bookingId: string }[]>([]);

  useEffect(() => {
    async function fetchConversations() {
      setLoading(true);
      const res = await fetch('/api/conversations');
      const data = await res.json();
      setConversations(data.conversations || []);
      setLoading(false);
    }
    fetchConversations();
  }, []);

  useEffect(() => {
    // TODO: Replace with real API calls to get user's bookings and service bookings
    // Example:
    // fetch('/api/bookings').then(...)
    // fetch('/api/service-bookings').then(...)
    // For now, leave empty arrays (so no conversations will show until integrated)
  }, [session]);

  // Filter logic: Only show hall_booking conversations for user's bookings, and service_booking for user's service bookings
  const filteredConversations = conversations.filter((conv: any) => {
    if (conv.conversationType === 'hall_booking') {
      // Only show if bookingId is in user's bookings
      return conv.bookingId && bookingIds.includes(conv.bookingId);
    }
    if (conv.conversationType === 'service_booking') {
      // Only show if serviceId+bookingId matches a user's service booking
      return serviceBookingMeta.some(meta => meta.serviceId === conv.serviceId && meta.bookingId === conv.bookingId);
    }
    return false;
  });

  if (loading) return <div className="text-gray-400">Loading...</div>;
  if (!filteredConversations.length) return <div className="text-gray-400">No conversations found.</div>;

  return (
    <ul className="space-y-2">
      {filteredConversations.map((conv) => (
        <li key={conv._id}>
          <Link
            href={`/messages/${conv._id}`}
            className={`block p-2 rounded hover:bg-gray-200 cursor-pointer ${pathname?.endsWith(conv._id) ? 'bg-gray-200 font-bold' : ''}`}
          >
            <div className="truncate">
              {conv.participants.map((p) => `${p.name} (${p.role.charAt(0).toUpperCase() + p.role.slice(1)})`).join(', ')}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {conv.lastMessage?.content ? conv.lastMessage.content : 'No messages yet.'}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}