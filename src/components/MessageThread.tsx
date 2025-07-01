'use client';

import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface Message {
  _id: string;
  from: { _id: string; name: string; role: string };
  content: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: { _id: string; name: string; role: string }[];
  conversationType: string;
}

const socket: Socket = io();

const MessageThread = forwardRef(function MessageThread(_, ref) {
  const params = useParams();
  const conversationId = params?.conversationId as string;
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  };

  const fetchConversation = async () => {
    const res = await fetch(`/api/conversations`);
    const data = await res.json();
    if (data.conversations) {
      const found = data.conversations.find((c: any) => c._id === conversationId);
      setConversation(found || null);
    }
  };

  useImperativeHandle(ref, () => ({ reload: fetchMessages }), [conversationId]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      fetchConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    socket.emit('join', conversationId);
    const handleNewMessage = (data: { message: Message }) => {
      setMessages((prev) => [...prev, data.message]);
    };
    socket.on('new_message', handleNewMessage);
    return () => {
      socket.emit('leave', conversationId);
      socket.off('new_message', handleNewMessage);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    fetchMessages();
  };

  const handleEdit = async (id: string) => {
    // TODO: Implement the edit message API endpoint
    // Example:
    // await fetch(`/api/messages/${id}`, { method: 'PUT', body: JSON.stringify({ content: editValue }) });
    setEditingId(null);
    fetchMessages();
  };

  if (loading) return <div className="text-gray-400">Loading messages...</div>;
  if (!messages.length) return <div className="text-gray-400">No messages yet.</div>;

  return (
    <div className="flex flex-col space-y-4 p-4 overflow-y-auto">
      {messages.map((message) => (
        <div
          key={message._id}
          className={`flex flex-col ${message.from._id === session?.user?.id ? 'items-end' : 'items-start'}`}
        >
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium">{message.from.name}</span>
            <span className="text-xs text-gray-500">
              {new Date(message.createdAt).toLocaleTimeString()}
            </span>
          </div>
          {editingId === message._id ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="border rounded px-2 py-1"
              />
              <button
                onClick={() => handleEdit(message._id)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="group relative">
              <div
                className={`max-w-md rounded-lg px-4 py-2 ${message.from._id === session?.user?.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
              </div>
              {message.from._id === session?.user?.id && (
                <div className="absolute right-0 top-0 hidden group-hover:flex space-x-2 -mt-6">
                  <button
                    onClick={() => {
                      setEditingId(message._id);
                      setEditValue(message.content);
                    }}
                    className="text-xs text-gray-600 hover:text-gray-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(message._id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
});

export default MessageThread;