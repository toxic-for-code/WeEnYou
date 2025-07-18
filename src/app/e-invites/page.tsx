'use client';
import React, { useState } from 'react';
import InviteCustomizer from '@/components/InviteCustomizer';

const categories = [
  { key: 'wedding', label: 'Wedding' },
  { key: 'birthday', label: 'Birthday' },
  { key: 'anniversary', label: 'Anniversary' },
  { key: 'corporate', label: 'Corporate Events' },
  { key: 'babyshower', label: 'Baby Shower' },
  { key: 'engagement', label: 'Engagement' },
];

const sampleTemplates = {
  wedding: [
    { id: 1, name: 'Classic Wedding', img: '/placeholder.jpg' },
    { id: 2, name: 'Modern Minimal', img: '/placeholder.jpg' },
  ],
  birthday: [
    { id: 3, name: 'Fun Birthday', img: '/placeholder.jpg' },
    { id: 4, name: 'Kids Party', img: '/placeholder.jpg' },
  ],
  anniversary: [
    { id: 5, name: 'Elegant Anniversary', img: '/placeholder.jpg' },
  ],
  corporate: [
    { id: 6, name: 'Corporate Classic', img: '/placeholder.jpg' },
  ],
  babyshower: [
    { id: 7, name: 'Baby Shower Blue', img: '/placeholder.jpg' },
  ],
  engagement: [
    { id: 8, name: 'Engagement Gold', img: '/placeholder.jpg' },
  ],
};

export default function EInvitesPage() {
  const [selectedCategory, setSelectedCategory] = useState('wedding');
  const [customizing, setCustomizing] = useState<null | { id: number; name: string; img: string; theme: string; header: string; names: string; body: string; details: string; rsvp: string }>(null);

  if (customizing) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center py-16">
        <h1 className="text-4xl font-bold mb-4 text-blue-900">Send E-Invites</h1>
        <InviteCustomizer template={customizing} onBack={() => setCustomizing(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-16">
      <h1 className="text-4xl font-bold mb-4 text-blue-900">Send E-Invites</h1>
      <p className="text-lg text-gray-700 mb-8 max-w-xl text-center">
        Create beautiful, personalized event invitations and send them to your guests via email or WhatsApp. Track RSVPs, set reminders, and make your event unforgettable!
      </p>
      <div className="w-full max-w-4xl">
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`px-4 py-2 rounded-full font-semibold border transition-colors ${selectedCategory === cat.key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-900 border-blue-200 hover:bg-blue-50'}`}
              onClick={() => setSelectedCategory(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {sampleTemplates[selectedCategory].map(template => (
            <div key={template.id} className="bg-blue-50 border border-blue-100 rounded-lg shadow p-4 flex flex-col items-center">
              <img src={template.img} alt={template.name} className="w-full h-48 object-cover rounded mb-3" />
              <div className="font-semibold text-blue-900 mb-2">{template.name}</div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition" onClick={() => setCustomizing(template)}>Customize</button>
            </div>
          ))}
          <div className="bg-white border border-yellow-200 rounded-lg shadow p-4 flex flex-col items-center" style={{ background: 'url(/templates/floral-script-bg.png) center/cover, #fff' }}>
            <div className="font-semibold text-yellow-700 mb-2">Floral Script Wedding</div>
            <div className="text-center text-gray-700 mb-4" style={{ fontFamily: 'Great Vibes, cursive', fontSize: 24 }}>
              Jennifer Janet<br />and<br />Frederick Wilson
            </div>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 font-semibold transition" onClick={() => setCustomizing({
              id: 999,
              name: 'Floral Script Wedding',
              img: '/templates/floral-script-bg.png',
              theme: 'floral-script-wedding',
              header: "YOU'RE INVITED TO THE WEDDING OF",
              names: 'Jennifer Janet\nand\nFrederick Wilson',
              body: '',
              details: '21 SEPTEMBER 2025\n18:00 - 21:00\n123 ANYWHERE ST., ANY CITY',
              rsvp: '',
            })}>Customize</button>
          </div>
        </div>
      </div>
    </div>
  );
} 