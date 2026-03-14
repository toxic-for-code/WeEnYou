'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  BanknotesIcon, 
  UsersIcon, 
  CheckBadgeIcon, 
  StarIcon,
  ChevronLeftIcon,
  TrashIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Hall {
  _id: string;
  name: string;
  description: string;
  images: string[];
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  price: number;
  capacity: number;
  verified: boolean;
  status: string;
  amenities: string[];
  averageRating: number;
  totalReviews: number;
  ownerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  platformFeePercent: number;
}

export default function AdminHallDetails({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [platformFee, setPlatformFee] = useState<number | ''>('');
  const [savingPlatformFee, setSavingPlatformFee] = useState(false);
  const [platformFeeMsg, setPlatformFeeMsg] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchHallDetails();
    }
  }, [session, status, router, params.id]);

  useEffect(() => {
    if (hall) setPlatformFee(hall.platformFeePercent ?? '');
  }, [hall]);

  const savePlatformFee = async () => {
    if (platformFee === '' || isNaN(Number(platformFee))) return;
    setSavingPlatformFee(true);
    setPlatformFeeMsg('');
    try {
      const response = await fetch(`/api/admin/halls/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformFeePercent: Number(platformFee) })
      });
      if (!response.ok) throw new Error('Failed to update platform fee');
      setPlatformFeeMsg('Platform fee updated!');
      setTimeout(() => setPlatformFeeMsg(''), 3000);
      await fetchHallDetails();
    } catch (e) {
      setPlatformFeeMsg('Failed to update platform fee');
    } finally {
      setSavingPlatformFee(false);
    }
  };

  const fetchHallDetails = async () => {
    try {
      const response = await fetch(`/api/admin/halls/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch hall');
      const data = await response.json();
      setHall(data.hall);
    } catch (error) {
      console.error('Error fetching hall details:', error);
      setError('Failed to fetch hall details');
    } finally {
      setLoading(false);
    }
  };

  const deleteHall = async () => {
    if (!confirm('Are you sure you want to delete this hall? This action cannot be undone.')) return;
    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/halls/${params.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete hall');
      router.push('/admin/halls');
    } catch (error) {
      setError('Failed to delete hall');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89B3C]"></div>
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="text-center py-20">
         <BuildingOfficeIcon className="w-12 h-12 text-gray-200 mx-auto" />
         <p className="text-gray-400 font-medium mt-4">Hall not found.</p>
         <Link href="/admin/halls" className="text-[#C89B3C] font-bold mt-2 inline-block">Back to Halls</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/halls" className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-gray-900 shadow-sm transition-all">
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{hall.name}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
               <span>Admin</span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span>Halls</span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span className="text-[#C89B3C]">#{hall._id.slice(-6)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Link href={`/halls/${hall._id}`} target="_blank" className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-all border border-gray-100 flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4" />
              View Live
           </Link>
           <button onClick={deleteHall} disabled={deleting} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all border border-red-100 flex items-center gap-2 disabled:opacity-50">
              <TrashIcon className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete Venue'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Main Image & Stats */}
           <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-[400px]">
                <Image
                  src={getImageUrl(hall.images[0] || '/placeholder.jpg')}
                  alt={hall.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-6 right-6 flex gap-2">
                   <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20 ${
                      hall.status === 'active' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                   }`}>
                      {hall.status}
                   </span>
                   {hall.verified && (
                      <span className="px-4 py-1.5 rounded-full bg-[#C89B3C]/90 text-white text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                         <ShieldCheckIcon className="w-4 h-4" />
                         Verified
                      </span>
                   )}
                </div>
              </div>
              <div className="p-8">
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Price / Day</p>
                       <p className="text-lg font-bold text-gray-900">₹{hall.price.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Capacity</p>
                       <p className="text-lg font-bold text-gray-900">{hall.capacity} Guests</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ratings</p>
                       <div className="flex items-center gap-1.5">
                          <p className="text-lg font-bold text-gray-900">{hall.averageRating.toFixed(1)}</p>
                          <StarIcon className="w-4 h-4 text-amber-500 fill-amber-500" />
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reviews</p>
                       <p className="text-lg font-bold text-gray-900">{hall.totalReviews}</p>
                    </div>
                 </div>

                 <div className="mt-8">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <InformationCircleIcon className="w-3.5 h-3.5" />
                       Description
                    </h4>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{hall.description}</p>
                 </div>
              </div>
           </div>

           {/* Location & Amenities */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    Location Details
                 </h4>
                 <div className="space-y-4">
                    <div className="flex items-start gap-3">
                       <div className="p-2 bg-gray-50 rounded-lg"><MapPinIcon className="w-4 h-4 text-gray-400" /></div>
                       <div>
                          <p className="text-xs font-bold text-gray-900">{hall.location.address}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{hall.location.city}, {hall.location.state} - {hall.location.pincode}</p>
                       </div>
                    </div>
                    <div className="h-40 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden relative">
                       <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <MapPinIcon className="w-12 h-12 text-gray-300" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    Amenities
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {hall.amenities.map((amenity, idx) => (
                       <span key={idx} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all hover:bg-[#C89B3C] hover:text-white hover:border-[#C89B3C]">
                          {amenity}
                       </span>
                    ))}
                 </div>
              </div>
           </div>

           {/* Image Gallery */}
           {hall.images.length > 1 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Additional Photos
                 </h4>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {hall.images.slice(1).map((image, index) => (
                       <div key={index} className="relative h-28 rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all cursor-zoom-in">
                          <Image
                             src={getImageUrl(image)}
                             alt={`${hall.name} - Image ${index + 2}`}
                             fill
                             className="object-cover"
                          />
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </div>

        <div className="space-y-8">
           {/* Owner Card */}
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <UserIcon className="w-3.5 h-3.5" />
                 Venue Owner
              </h4>
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center font-bold text-xl text-[#C89B3C]">
                    {hall.ownerId.name.charAt(0)}
                 </div>
                 <div>
                    <p className="font-bold text-gray-900 leading-none">{hall.ownerId.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Member Since 2023</p>
                 </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-50">
                 <div className="flex items-center gap-3 text-xs text-gray-600">
                    <p className="font-medium truncate">{hall.ownerId.email}</p>
                 </div>
                 <div className="flex items-center gap-3 text-xs text-gray-600">
                    <p className="font-medium">{hall.ownerId.phone}</p>
                 </div>
              </div>
           </div>

           {/* Platform Fee Control */}
           <div className="bg-[#C89B3C] rounded-3xl p-8 shadow-lg shadow-[#C89B3C]/20 text-white space-y-6">
              <div>
                 <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-2">Platform Settings</h4>
                 <p className="text-xl font-bold">Revenue & Fees</p>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-70 block mb-2">Platform Fee (%)</label>
                    <div className="relative">
                       <input
                          type="number"
                          min={0}
                          max={100}
                          value={platformFee}
                          onChange={e => setPlatformFee(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 text-sm font-bold placeholder-white/30"
                          disabled={savingPlatformFee}
                          placeholder="e.g. 10"
                       />
                       <button
                          onClick={savePlatformFee}
                          disabled={savingPlatformFee || platformFee === ''}
                          className="absolute right-2 top-2 bottom-2 px-4 bg-white text-[#C89B3C] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 disabled:opacity-50 transition-all border-none"
                       >
                          {savingPlatformFee ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Update'}
                       </button>
                    </div>
                    {platformFeeMsg && <p className="text-[10px] font-bold mt-2 animate-pulse">{platformFeeMsg}</p>}
                 </div>
                 <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Last Updated</p>
                    <p className="text-xs font-bold">{new Date(hall.updatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}