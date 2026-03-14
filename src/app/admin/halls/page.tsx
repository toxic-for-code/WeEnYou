'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';
import { 
  BuildingOfficeIcon, 
  CheckBadgeIcon, 
  MapPinIcon, 
  UsersIcon, 
  BanknotesIcon,
  StarIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

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
  status: 'active' | 'inactive' | 'pending' | 'rejected';
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
  featured: boolean;
  platformFeePercent?: number;
}

export default function AdminHalls() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifyingHalls, setVerifyingHalls] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [approvingHalls, setApprovingHalls] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'featured'>('all');
  const [togglingFeatured, setTogglingFeatured] = useState<string[]>([]);
  const [platformFeeEdits, setPlatformFeeEdits] = useState<{[id: string]: number}>({});
  const [savingPlatformFee, setSavingPlatformFee] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'pending') {
      setActiveTab('pending');
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchHalls();
    }
  }, [session, status, router]);

  const fetchHalls = async () => {
    try {
      const response = await fetch('/api/admin/halls');
      const data = await response.json();
      const cachedStatus = localStorage.getItem('hallVerificationStatus');
      const verificationStatus = cachedStatus ? JSON.parse(cachedStatus) : {};
      const updatedHalls = data.halls.map((hall: Hall) => ({
        ...hall,
        verified: verificationStatus[hall._id] ?? hall.verified
      }));
      setHalls(updatedHalls);
    } catch (error) {
      console.error('Error fetching halls:', error);
      setError('Failed to fetch halls');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (hallId: string, verified: boolean) => {
    try {
      setVerifyingHalls(prev => [...prev, hallId]);
      const response = await fetch(`/api/admin/halls/${hallId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to update verification status');
      const { hall: updatedHall, message } = await response.json();
      setHalls(prevHalls => prevHalls.map(hall => hall._id === hallId ? { ...hall, verified: updatedHall.verified } : hall));
      const cachedStatus = localStorage.getItem('hallVerificationStatus');
      const verificationStatus = cachedStatus ? JSON.parse(cachedStatus) : {};
      verificationStatus[hallId] = updatedHall.verified;
      localStorage.setItem('hallVerificationStatus', JSON.stringify(verificationStatus));
      setError('');
    } catch (error) {
      setError('Failed to update verification status');
    } finally {
      setVerifyingHalls(prev => prev.filter(id => id !== hallId));
    }
  };

  const updateAllHalls = async () => {
    try {
      setUpdating(true);
      const response = await fetch('/api/admin/halls/update-all', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to update halls');
      await fetchHalls();
      setError('');
      setSuccess('Successfully updated all halls data');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update halls');
    } finally {
      setUpdating(false);
    }
  };

  const approveHall = async (hallId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setApprovingHalls(prev => [...prev, hallId]);
      const response = await fetch(`/api/admin/halls/${hallId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update hall status');
      }
      const { hall: updatedHall, message } = await response.json();
      setHalls(prevHalls => prevHalls.map(hall => hall._id === hallId ? { ...hall, status: updatedHall.status, verified: updatedHall.verified } : hall));
      setError('');
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to update hall status');
    } finally {
      setApprovingHalls(prev => prev.filter(id => id !== hallId));
    }
  };

  const handleToggleFeatured = async (hallId: string, currentFeatured: boolean) => {
    if (togglingFeatured.includes(hallId)) return;
    setTogglingFeatured(prev => [...prev, hallId]);
    try {
      const response = await fetch(`/api/admin/halls/${hallId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message || 'Featured status updated successfully');
        fetchHalls();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update featured status');
      }
    } catch (error) {
      setError('Error updating featured status');
    } finally {
      setTogglingFeatured(prev => prev.filter(id => id !== hallId));
    }
  };

  const approveHallWithPlatformFee = async (hallId: string) => {
    let percent = prompt('Enter platform fee percent (e.g. 10, 15, 20):', '10');
    if (!percent) return;
    percent = percent.replace(/[^0-9.]/g, '');
    const num = Number(percent);
    if (isNaN(num) || num < 0 || num > 100) {
      alert('Invalid platform fee percent');
      return;
    }
    setApprovingHalls(prev => [...prev, hallId]);
    try {
      const response = await fetch(`/api/admin/halls/${hallId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', platformFeePercent: num }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve hall');
      }
      const { hall: updatedHall, message } = await response.json();
      setHalls(prevHalls => prevHalls.map(hall => hall._id === hallId ? { ...hall, status: updatedHall.status, verified: updatedHall.verified, platformFeePercent: updatedHall.platformFeePercent } : hall));
      setError('');
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to approve hall');
    } finally {
      setApprovingHalls(prev => prev.filter(id => id !== hallId));
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Halls</h1>
          <p className="text-gray-500 text-sm mt-1">Review, approve, and manage all venue listings on the platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={updateAllHalls}
            disabled={updating}
            className="px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all flex items-center gap-2 text-sm"
          >
            <ArrowPathIcon className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
            {updating ? 'Updating...' : 'Refresh All'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white p-1 rounded-xl border border-gray-100 inline-flex shadow-sm">
        {[
          { id: 'all', label: 'All Halls', count: halls.length },
          { id: 'pending', label: 'Pending Approval', count: halls.filter(h => h.status === 'pending').length },
          { id: 'featured', label: 'Featured', count: halls.filter(h => h.featured).length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'bg-[#C89B3C] text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700 text-sm animate-in slide-in-from-top-2">
          <XMarkIcon className="w-5 h-5" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-3 text-green-700 text-sm animate-in slide-in-from-top-2">
          <CheckIcon className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {halls
          .filter(hall => {
            if (activeTab === 'all') return hall.status !== 'rejected';
            if (activeTab === 'pending') return hall.status === 'pending';
            if (activeTab === 'featured') return hall.featured && hall.status !== 'rejected';
            return hall.status !== 'rejected';
          })
          .map((hall) => (
            <div key={hall._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
              {/* Card Image Area */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={getImageUrl(hall.images[0] || '/placeholder.jpg')}
                  alt={hall.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg border border-white/20 backdrop-blur-md ${
                    hall.status === 'active' ? 'bg-green-500/90 text-white' : 
                    hall.status === 'pending' ? 'bg-amber-500/90 text-white' : 
                    'bg-red-500/90 text-white'
                  }`}>
                    {hall.status}
                  </span>
                  {hall.featured && (
                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-gold/90 text-white shadow-lg flex items-center gap-1 border border-white/20 backdrop-blur-md">
                      <SparklesIcon className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                </div>
                {hall.verified && (
                  <div className="absolute top-4 right-4">
                    <CheckBadgeIcon className="w-8 h-8 text-[#C89B3C] drop-shadow-lg" />
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                   <div className="backdrop-blur-md bg-black/40 p-2 rounded-xl border border-white/10">
                      <div className="flex items-center gap-1 text-white">
                        <MapPinIcon className="w-3 h-3 text-[#C89B3C]" />
                        <span className="text-[10px] font-bold truncate">{hall.location.city}, {hall.location.state}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#C89B3C] transition-colors line-clamp-1">{hall.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{hall.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <UsersIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Capacity</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{hall.capacity} Guests</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <BanknotesIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pricing</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">₹{hall.price.toLocaleString()}/day</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                   <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Owner</span>
                      <span className="font-bold text-gray-900">{hall.ownerId.name}</span>
                   </div>
                   <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Platform Fee</span>
                      <span className="px-2 py-0.5 rounded-lg bg-gray-100 font-bold text-gray-900">{hall.platformFeePercent || '0'}%</span>
                   </div>
                   <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Rating</span>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
                        <StarIcon className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-amber-700">{hall.averageRating.toFixed(1)} <span className="text-amber-400 font-normal">({hall.totalReviews})</span></span>
                      </div>
                   </div>
                </div>

                {hall.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {hall.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100/50 text-gray-500 text-[9px] font-bold uppercase tracking-wider rounded-md border border-gray-100">
                        {amenity}
                      </span>
                    ))}
                    {hall.amenities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-400 text-[9px] font-bold uppercase tracking-wider rounded-md border border-gray-100">
                        +{hall.amenities.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                  {hall.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => approveHallWithPlatformFee(hall._id)}
                        disabled={approvingHalls.includes(hall._id)}
                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-green-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {approvingHalls.includes(hall._id) ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                        Approve
                      </button>
                      <button
                        onClick={() => approveHall(hall._id, 'reject')}
                        disabled={approvingHalls.includes(hall._id)}
                        className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XMarkIcon className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleVerification(hall._id, !hall.verified)}
                        disabled={verifyingHalls.includes(hall._id)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                          hall.verified 
                            ? 'bg-green-50 border-green-100 text-green-600 hover:bg-green-100' 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        } disabled:opacity-50`}
                      >
                        {verifyingHalls.includes(hall._id) ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : hall.verified ? <CheckBadgeIcon className="w-4 h-4" /> : <CheckCircleIconSolid className="w-4 h-4 text-gray-300" />}
                        {hall.verified ? 'Verified' : 'Verify'}
                      </button>
                      
                      {hall.status === 'active' && (
                        <button
                          onClick={() => handleToggleFeatured(hall._id, hall.featured)}
                          disabled={togglingFeatured.includes(hall._id)}
                          className={`p-2.5 rounded-xl transition-all border ${
                            hall.featured
                              ? 'bg-gold/10 border-gold/20 text-[#C89B3C]'
                              : 'bg-white border-gray-200 text-gray-400 hover:text-[#C89B3C] hover:border-[#C89B3C]'
                          } disabled:opacity-50`}
                          title={hall.featured ? 'Remove from Featured' : 'Mark as Featured'}
                        >
                          <SparklesIcon className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                  <Link 
                    href={`/admin/halls/${hall._id}`} 
                    className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl border border-gray-100 transition-all"
                    title="View Full Details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}