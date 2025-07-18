'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Verifications</h1>
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'verified' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setActiveTab('verified')}
        >
          Verified
        </button>
      </div>
      {verifications.length === 0 ? (
        <div>No {activeTab === 'pending' ? 'pending' : 'verified'} verifications.</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Venue Name</th>
              <th className="border px-4 py-2">Owner Name</th>
              <th className="border px-4 py-2">Submitted At</th>
              <th className="border px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {verifications.map((v) => (
              <tr key={v._id}>
                <td className="border px-4 py-2">{v.venueName}</td>
                <td className="border px-4 py-2">{v.ownerName}</td>
                <td className="border px-4 py-2">{new Date(v.createdAt).toLocaleString()}</td>
                <td className="border px-4 py-2">
                  {activeTab === 'verified' ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Verified ✓</span>
                  ) : (
                    <Link href={`/admin/verifications/${v._id}`} className="text-blue-600 underline">Review</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminVerificationsPage; 