'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PencilSquareIcon, 
  ChevronLeftIcon, 
  CheckBadgeIcon, 
  TrashIcon, 
  ArrowPathIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  BanknotesIcon,
  UsersIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Hall {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  price: number;
  location: {
    city: string;
    state: string;
  };
  verified: boolean;
}

export default function AdminEditHall({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    capacity: 0,
    price: 0,
    city: '',
    state: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchHall();
    }
  }, [session, status, router, params.id]);

  const fetchHall = async () => {
    try {
      const res = await fetch(`/api/halls/${params.id}`);
      const data = await res.json();
      setHall(data.hall);
      setForm({
        name: data.hall.name,
        description: data.hall.description,
        capacity: data.hall.capacity,
        price: data.hall.price,
        city: data.hall.location.city,
        state: data.hall.location.state,
      });
    } catch (err) {
      setError('Failed to fetch hall data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/halls/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          capacity: Number(form.capacity),
          price: Number(form.price),
          location: { city: form.city, state: form.state },
        }),
      });
      if (!res.ok) throw new Error('Failed to update hall');
      router.push(`/admin/halls/${params.id}`);
    } catch (err) {
      setError('Failed to update hall.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this hall? This action cannot be undone.')) return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/halls/${params.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete hall');
      router.push('/admin/halls');
    } catch (err) {
      setError('Failed to delete hall.');
      setDeleting(false);
    }
  };

  const handleVerificationToggle = async () => {
    setVerifying(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/halls/${params.id}/verify`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to toggle verification');
      const data = await res.json();
      setHall(data.hall);
    } catch (err) {
      setError('Failed to toggle verification status.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89B3C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/admin/halls/${params.id}`} className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-gray-900 shadow-sm transition-all">
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Venue</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
               <span>Admin</span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span>Halls</span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span className="text-[#C89B3C]">Edit Mode</span>
            </div>
          </div>
        </div>
        <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all border border-red-100 flex items-center gap-2 disabled:opacity-50">
           <TrashIcon className="w-4 h-4" />
           {deleting ? 'Deleting...' : 'Delete Venue'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Venue Name</label>
                    <div className="relative">
                       <BuildingOfficeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50 transition-all"
                          required
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Daily Price (₹)</label>
                    <div className="relative">
                       <BanknotesIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input
                          type="number"
                          name="price"
                          value={form.price}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50 transition-all"
                          required
                       />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Max Capacity</label>
                    <div className="relative">
                       <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input
                          type="number"
                          name="capacity"
                          value={form.capacity}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50 transition-all"
                          required
                       />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">City</label>
                       <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50 transition-all"
                          required
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">State</label>
                       <input
                          type="text"
                          name="state"
                          value={form.state}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50 transition-all"
                          required
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                 <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50 transition-all min-h-[160px] resize-none"
                    required
                 />
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-end">
                 <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#C89B3C] transition-all shadow-xl shadow-gray-900/10 flex items-center gap-3 disabled:opacity-50"
                 >
                    {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PencilSquareIcon className="w-4 h-4" />}
                    Save All Changes
                 </button>
              </div>
           </form>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <CheckBadgeIcon className="w-4 h-4" />
                 Verification Status
              </h4>
              <div className={`p-4 rounded-2xl border flex flex-col items-center gap-4 text-center ${
                 hall?.verified ? 'bg-green-50 border-green-100 text-green-700' : 'bg-amber-50 border-amber-100 text-amber-700'
              }`}>
                 {hall?.verified ? (
                    <CheckBadgeIcon className="w-10 h-10" />
                 ) : (
                    <ExclamationCircleIcon className="w-10 h-10" />
                 )}
                 <div>
                    <p className="font-bold text-sm">{hall?.verified ? 'Verified Venue' : 'Pending Verification'}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mt-1">Status: {hall?.verified ? 'Live' : 'Hidden'}</p>
                 </div>
                 <button
                    onClick={handleVerificationToggle}
                    disabled={verifying}
                    className={`w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                       hall?.verified ? 'bg-white text-green-600 border border-green-200 hover:bg-green-100' : 'bg-[#C89B3C] text-white shadow-md'
                    }`}
                 >
                    {verifying ? 'Updating...' : hall?.verified ? 'Revoke Verification' : 'Verify Now'}
                 </button>
              </div>
           </div>

           <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <InformationCircleIcon className="w-4 h-4" />
                 Quick Info
              </h4>
              <ul className="space-y-4">
                 <li className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Auto-save</span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-500 rounded-md text-[8px] font-bold uppercase tracking-widest">Disabled</span>
                 </li>
                 <li className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Re-review Needed</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-md text-[8px] font-bold uppercase tracking-widest">Yes</span>
                 </li>
              </ul>
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