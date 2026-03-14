'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Cog6ToothIcon, 
  EnvelopeIcon, 
  BellIcon, 
  BanknotesIcon, 
  ClockIcon, 
  TrashIcon, 
  PlusIcon,
  HandThumbUpIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';


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
      bookingTimeSlots: [...prev.bookingTimeSlots, { start: '09:00', end: '23:00' }]
    }));
  };

  const handleRemoveTimeSlot = (index: number) => {
    setSettings(prev => ({
      ...prev,
      bookingTimeSlots: prev.bookingTimeSlots.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89B3C]"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Cog6ToothIcon },
    { id: 'email', label: 'Email Templates', icon: EnvelopeIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Global configuration for fees, notifications, and automated communications.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving} 
          className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#C89B3C] transition-all shadow-xl shadow-gray-900/10 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <HandThumbUpIcon className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-white border border-gray-100 rounded-2xl w-fit shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-[#C89B3C] text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-10">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <BanknotesIcon className="w-3.5 h-3.5" />
                       Platform Commission (%)
                    </label>
                    <input
                      type="number"
                      value={settings.platformFee}
                      onChange={(e) => setSettings(prev => ({ ...prev, platformFee: Number(e.target.value) }))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50 transition-all"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <GlobeAltIcon className="w-3.5 h-3.5" />
                       Default Currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50 transition-all cursor-pointer"
                    >
                      <option value="INR">Indian Rupee (₹)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <ClockIcon className="w-3.5 h-3.5" />
                    Standard Booking Intervals
                  </h3>
                  <div className="grid gap-3">
                    {settings.bookingTimeSlots.map((slot, index) => (
                      <div key={index} className="flex gap-4 items-center animate-in fade-in duration-300">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                           <input
                             type="time"
                             value={slot.start}
                             onChange={(e) => setSettings(prev => ({
                               ...prev,
                               bookingTimeSlots: prev.bookingTimeSlots.map((s, i) => i === index ? { ...s, start: e.target.value } : s)
                             }))}
                             className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700"
                           />
                           <input
                             type="time"
                             value={slot.end}
                             onChange={(e) => setSettings(prev => ({
                               ...prev,
                               bookingTimeSlots: prev.bookingTimeSlots.map((s, i) => i === index ? { ...s, end: e.target.value } : s)
                             }))}
                             className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700"
                           />
                        </div>
                        <button
                          onClick={() => handleRemoveTimeSlot(index)}
                          className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddTimeSlot}
                      className="w-fit flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-[#C89B3C] text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all border border-dashed border-gray-200"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      Add New Slot
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                {[
                  { key: 'bookingConfirmation', label: 'Booking Confirmation', vars: '{{userName}}, {{hallName}}, {{bookingDate}}, {{amount}}' },
                  { key: 'paymentSuccess', label: 'Payment Success Receipt', vars: '{{userName}}, {{hallName}}, {{amount}}, {{transactionId}}' },
                  { key: 'bookingCancellation', label: 'Cancellation Notice', vars: '{{userName}}, {{hallName}}, {{bookingDate}}, {{refundAmount}}' },
                  { key: 'hallVerification', label: 'Verification Status Update', vars: '{{ownerName}}, {{hallName}}, {{verificationStatus}}' }
                ].map((tmpl) => (
                  <div key={tmpl.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                       <label className="text-sm font-bold text-gray-900">{tmpl.label}</label>
                       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">HTML / Markdown</span>
                    </div>
                    <div className="relative group">
                       <textarea
                         value={settings.emailTemplates[tmpl.key as keyof typeof settings.emailTemplates]}
                         onChange={(e) => setSettings(prev => ({
                           ...prev,
                           emailTemplates: { ...prev.emailTemplates, [tmpl.key]: e.target.value }
                         }))}
                         className="w-full h-40 bg-[#1A1C21] text-gray-300 rounded-2xl p-6 font-mono text-xs focus:ring-2 focus:ring-[#C89B3C]/50 transition-all leading-relaxed scrollbar-thin scrollbar-thumb-gray-700"
                         placeholder="Enter email content..."
                       />
                       <div className="absolute bottom-4 right-6 text-[9px] font-bold text-[#C89B3C]/50 uppercase tracking-widest">
                          {tmpl.vars}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                {[
                  { key: 'emailNotifications', label: 'User Marketing & Transactional', desc: 'Allow the platform to send automated emails to end-customers.' },
                  { key: 'adminEmailNotifications', label: 'Administrative System Alerts', desc: 'Critical alerts for platform admins regarding system health and large transactions.' },
                  { key: 'ownerEmailNotifications', label: 'Partner & Venue Owner Communication', desc: 'Daily digests and booking alerts for registered venue owners.' }
                ].map((notif) => (
                  <label key={notif.key} className="group flex items-center justify-between p-6 bg-gray-50 border border-gray-100 rounded-3xl hover:bg-white hover:border-[#C89B3C]/30 hover:shadow-lg hover:shadow-gold/5 transition-all cursor-pointer">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-[#C89B3C] transition-colors">{notif.label}</p>
                      <p className="text-xs text-gray-400 pr-8">{notif.desc}</p>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={settings.notifications[notif.key as keyof typeof settings.notifications]}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, [notif.key]: e.target.checked }
                        }))}
                        className="sr-only peer" 
                      />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C89B3C]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C89B3C]"></div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-gray-900 rounded-3xl p-8 shadow-xl shadow-gray-900/10 text-white space-y-6">
              <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheckIcon className="w-4 h-4" />
                 Platform Security
              </h4>
              <p className="text-xs text-gray-400 border-l-2 border-[#C89B3C] pl-4 italic">
                 "Changes to core settings may impact active bookings and financial reconciliation logs."
              </p>
              <div className="pt-4 space-y-3">
                 <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500 uppercase tracking-widest">Environment</span>
                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest">Production</span>
                 </div>
                 <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-500 uppercase tracking-widest">API Version</span>
                    <span className="font-bold">v3.12.0</span>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <DocumentTextIcon className="w-4 h-4" />
                 Audit Trail
              </h4>
              <div className="space-y-4">
                 <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                    <div>
                       <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Last change</p>
                       <p className="text-[10px] text-gray-400 mt-0.5">Today at 10:45 AM by System Admin</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5" />
                    <div>
                       <p className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Platform Fee update</p>
                       <p className="text-[10px] text-gray-400 mt-0.5">2 days ago by User Review</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
           <ExclamationCircleIcon className="w-5 h-5" />
           <p className="text-sm font-bold">{error}</p>
        </div>
      )}
    </div>
  );
}