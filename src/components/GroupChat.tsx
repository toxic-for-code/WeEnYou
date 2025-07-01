'use client';

import React, { useEffect, useState, useRef } from 'react';

interface GroupChatProps {
  booking_id: string;
  user_id: string;
  owner_id: string;
  provider_id: string;
  current_user_id: string;
  current_user_role: 'user' | 'owner' | 'provider';
}

interface Message {
  _id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  timestamp: string;
}

export default function GroupChat({ booking_id, user_id, owner_id, provider_id, current_user_id, current_user_role }: GroupChatProps) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get or create chat room
  useEffect(() => {
    async function getRoom() {
      setLoading(true);
      const res = await fetch('/api/chat-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id, user_id, owner_id, provider_id })
      });
      const data = await res.json();
      if (!res.ok || !data.room || !data.room._id) {
        setLoading(false);
        setRoomId(null);
        // Optionally, set an error state and show a message
        return;
      }
      setRoomId(data.room._id);
      setLoading(false);
    }
    getRoom();
  }, [booking_id, user_id, owner_id, provider_id]);

  // Fetch messages (poll every 3s)
  useEffect(() => {
    if (!roomId) return;
    let interval: NodeJS.Timeout;
    async function fetchMessages() {
      const res = await fetch(`/api/chat-room/${roomId}/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
    }
    fetchMessages();
    interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !roomId) return;
    await fetch(`/api/chat-room/${roomId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: current_user_id, sender_role: current_user_role, content: input })
    });
    setInput('');
  }

  if (loading) return <div>Loading chat...</div>;
  if (!roomId) return <div className="text-red-500">Unable to load chat room. Please try again later or contact support.</div>;
  return (
    <div className="flex flex-col h-[60vh] border rounded-lg shadow p-4 bg-white">
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map(msg => (
          <div key={msg._id} className={`mb-2 ${msg.sender_id === current_user_id ? 'text-right' : 'text-left'}`}>
            <div className="text-xs text-gray-500">
              {msg.sender_role.charAt(0).toUpperCase() + msg.sender_role.slice(1)} • {new Date(msg.timestamp).toLocaleString()}
            </div>
            <div className={`inline-block px-3 py-2 rounded ${msg.sender_id === current_user_id ? 'bg-blue-100' : 'bg-gray-100'}`}>{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2 mt-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!input.trim()}>Send</button>
      </form>
    </div>
  );
}