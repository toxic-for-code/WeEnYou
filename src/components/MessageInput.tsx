'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';

interface MessageInputProps {
  onMessageSent?: () => void;
}

export default function MessageInput({ onMessageSent }: MessageInputProps) {
  const params = useParams();
  const conversationId = params?.conversationId as string;
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setLoading(true);
    await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: value }),
    });
    setValue('');
    setLoading(false);
    onMessageSent?.();
  }

  return (
    <form onSubmit={handleSend} className="p-4 border-t">
      <div className="flex space-x-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}