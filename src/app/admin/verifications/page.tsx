'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  ClockIcon, 
  BuildingOfficeIcon, 
  UserIcon, 
  CalendarIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

interface Verification {
  _id: string;
  user: string;
  venueName: string;
  ownerName: string;
  status: string;
  createdAt: string;
}

const AdminVerificationsPage = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');

  useEffect(() => {
    const fetchVerifications = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/verifications?status=${activeTab === 'pending' ? 'pending' : 'approved'}`);
        if (!res.ok) throw new Error('Failed to fetch verifications');
        const data = await res.json();
        setVerifications(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVerifications();
  }, [activeTab]);

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
          <h1 className="text-2xl font-bold text-gray-900">User Verifications</h1>
          <p className="text-gray-500 text-sm mt-1">Review legal documentation and verify venue ownership identities.</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white p-1 rounded-xl border border-gray-100 inline-flex shadow-sm">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'pending' 
              ? 'bg-[#C89B3C] text-white shadow-md' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <ClockIcon className="w-4 h-4" />
          Pending
          {activeTab === 'pending' && verifications.length > 0 && (
            <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-md text-[10px]">{verifications.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'verified' 
              ? 'bg-[#C89B3C] text-white shadow-md' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <CheckCircleIcon className="w-4 h-4" />
          Verified
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <ExclamationCircleIcon className="w-5 h-5" />
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Venue Information</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Owner Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Submission Date</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {verifications.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                          <BuildingOfficeIcon className="w-5 h-5 text-[#C89B3C]" />
                        </div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-[#C89B3C] transition-colors">{v.venueName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">{v.ownerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-medium">{new Date(v.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {activeTab === 'verified' ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <ShieldCheckIcon className="w-3.5 h-3.5" />
                          Verified
                        </div>
                      ) : (
                        <Link 
                          href={`/admin/verifications/${v._id}`} 
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-[#C89B3C] transition-all shadow-lg shadow-gray-900/10"
                        >
                          Review Request
                          <ChevronRightIcon className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {verifications.length === 0 && (
              <div className="text-center py-24">
                 <ShieldCheckIcon className="w-16 h-16 text-gray-100 mx-auto" />
                 <p className="text-gray-400 font-bold mt-4 uppercase tracking-[0.2em] text-xs">No {activeTab} verifications found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerificationsPage;