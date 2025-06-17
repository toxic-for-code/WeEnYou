'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Settings {
  platformFee: number;
  currency: string;
  bookingTimeSlots: {
    start: string;
    end: string;
  }[];
  emailTemplates: {
    bookingConfirmation: string;
    paymentSuccess: string;
    bookingCancellation: string;
    hallVerification: string;
  };
  notifications: {
    emailNotifications: boolean;
    adminEmailNotifications: boolean;
    ownerEmailNotifications: boolean;
  };
}

export default function AdminSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    platformFee: 5,
    currency: 'INR',
    bookingTimeSlots: [
      { start: '09:00', end: '23:00' }
    ],
    emailTemplates: {
      bookingConfirmation: '',
      paymentSuccess: '',
      bookingCancellation: '',
      hallVerification: ''
    },
    notifications: {
      emailNotifications: true,
      adminEmailNotifications: true,
      ownerEmailNotifications: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchSettings();
    }
  }, [session, status, router]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      setSettings(data.settings);
    } catch (err) {
      setError('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      
      if (!res.ok) throw new Error('Failed to save settings');
      
      const data = await res.json();
      setSettings(data.settings);
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTimeSlot = () => {
    setSettings(prev => ({
      ...prev,
      bookingTimeSlots: [
        ...prev.bookingTimeSlots,
        { start: '09:00', end: '23:00' }
      ]
    }));
  };

  const handleRemoveTimeSlot = (index: number) => {
    setSettings(prev => ({
      ...prev,
      bookingTimeSlots: prev.bookingTimeSlots.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Platform Settings</h1>

      {/* Tabs */}
      <div className="mb-8 border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-2 px-4 ${
              activeTab === 'general'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`pb-2 px-4 ${
              activeTab === 'email'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Email Templates
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-2 px-4 ${
              activeTab === 'notifications'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Notifications
          </button>
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div>
            <label className="block font-medium mb-2">Platform Fee (%)</label>
            <input
              type="number"
              value={settings.platformFee}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                platformFee: Number(e.target.value)
              }))}
              className="w-full md:w-1/3 px-4 py-2 border rounded"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                currency: e.target.value
              }))}
              className="w-full md:w-1/3 px-4 py-2 border rounded"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-2">Booking Time Slots</label>
            <div className="space-y-4">
              {settings.bookingTimeSlots.map((slot, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="time"
                    value={slot.start}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      bookingTimeSlots: prev.bookingTimeSlots.map((s, i) =>
                        i === index ? { ...s, start: e.target.value } : s
                      )
                    }))}
                    className="px-4 py-2 border rounded"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={slot.end}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      bookingTimeSlots: prev.bookingTimeSlots.map((s, i) =>
                        i === index ? { ...s, end: e.target.value } : s
                      )
                    }))}
                    className="px-4 py-2 border rounded"
                  />
                  <button
                    onClick={() => handleRemoveTimeSlot(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddTimeSlot}
                className="text-blue-600 hover:text-blue-700"
              >
                + Add Time Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Templates */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <div>
            <label className="block font-medium mb-2">Booking Confirmation</label>
            <textarea
              value={settings.emailTemplates.bookingConfirmation}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                emailTemplates: {
                  ...prev.emailTemplates,
                  bookingConfirmation: e.target.value
                }
              }))}
              className="w-full h-48 px-4 py-2 border rounded font-mono"
              placeholder="Available variables: {{userName}}, {{hallName}}, {{bookingDate}}, {{amount}}"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Payment Success</label>
            <textarea
              value={settings.emailTemplates.paymentSuccess}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                emailTemplates: {
                  ...prev.emailTemplates,
                  paymentSuccess: e.target.value
                }
              }))}
              className="w-full h-48 px-4 py-2 border rounded font-mono"
              placeholder="Available variables: {{userName}}, {{hallName}}, {{amount}}, {{transactionId}}"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Booking Cancellation</label>
            <textarea
              value={settings.emailTemplates.bookingCancellation}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                emailTemplates: {
                  ...prev.emailTemplates,
                  bookingCancellation: e.target.value
                }
              }))}
              className="w-full h-48 px-4 py-2 border rounded font-mono"
              placeholder="Available variables: {{userName}}, {{hallName}}, {{bookingDate}}, {{refundAmount}}"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Hall Verification</label>
            <textarea
              value={settings.emailTemplates.hallVerification}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                emailTemplates: {
                  ...prev.emailTemplates,
                  hallVerification: e.target.value
                }
              }))}
              className="w-full h-48 px-4 py-2 border rounded font-mono"
              placeholder="Available variables: {{ownerName}}, {{hallName}}, {{verificationStatus}}"
            />
          </div>
        </div>
      )}

      {/* Notification Settings */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    emailNotifications: e.target.checked
                  }
                }))}
                className="form-checkbox"
              />
              <span>Enable Email Notifications for Users</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.notifications.adminEmailNotifications}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    adminEmailNotifications: e.target.checked
                  }
                }))}
                className="form-checkbox"
              />
              <span>Enable Email Notifications for Admins</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.notifications.ownerEmailNotifications}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  notifications: {
                    ...prev.notifications,
                    ownerEmailNotifications: e.target.checked
                  }
                }))}
                className="form-checkbox"
              />
              <span>Enable Email Notifications for Hall Owners</span>
            </label>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
} 