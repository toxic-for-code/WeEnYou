'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Reference {
  name: string;
  contact: string;
  relation: string;
}

interface Verification {
  _id: string;
  user: string;
  venueName: string;
  venueAddress: string;
  ownerName: string;
  contact: string;
  govtId: string;
  ownershipProof: string;
  businessCert?: string;
  gst?: string;
  pan: string;
  bankProof: string;
  fireCert: string;
  occupancyCert: string;
  permissions: string;
  photos: string[];
  layout: string;
  references: Reference[];
  declaration: boolean;
  signature: string;
  status: string;
  createdAt: string;
  feedback?: string;
}

const VerificationDetailPage = ({ params }: { params: { id: string } }) => {
  const [verification, setVerification] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await fetch(`/api/admin/verifications/${params.id}`);
        if (!res.ok) throw new Error('Failed to fetch verification');
        const data = await res.json();
        setVerification(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVerification();
  }, [params.id]);

  const handleAction = async (status: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/verifications/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback: status === 'rejected' ? feedback : '' }),
      });
      if (!res.ok) throw new Error('Failed to update verification');
      router.push('/admin/verifications');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to proxy S3 URLs through the API route if not already absolute
  const getProxyUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `/api/aws-file-proxy${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!verification) return <div>Not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Verification Details</h1>
      <div className="mb-4">
        <strong>Venue Name:</strong> {verification.venueName}<br />
        <strong>Venue Address:</strong> {verification.venueAddress}<br />
        <strong>Owner Name:</strong> {verification.ownerName}<br />
        <strong>Contact:</strong> {verification.contact}<br />
        <strong>Declaration:</strong> {verification.declaration ? 'Yes' : 'No'}<br />
        <strong>Signature:</strong> {verification.signature}<br />
        <strong>Status:</strong> {verification.status}<br />
        <strong>Submitted At:</strong> {new Date(verification.createdAt).toLocaleString()}<br />
      </div>
      <div className="mb-4">
        <h2 className="font-semibold">Documents</h2>
        <ul className="list-disc ml-6">
          <li><a href={getProxyUrl(verification.govtId)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Government ID</a></li>
          <li><a href={getProxyUrl(verification.ownershipProof)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ownership Proof</a></li>
          {verification.businessCert && <li><a href={getProxyUrl(verification.businessCert)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Business Certificate</a></li>}
          {verification.gst && <li><a href={getProxyUrl(verification.gst)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">GST Certificate</a></li>}
          <li><a href={getProxyUrl(verification.pan)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">PAN Card</a></li>
          <li><a href={getProxyUrl(verification.bankProof)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Bank Proof</a></li>
          <li><a href={getProxyUrl(verification.fireCert)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Fire Safety Certificate</a></li>
          <li><a href={getProxyUrl(verification.occupancyCert)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Occupancy Certificate</a></li>
          <li><a href={getProxyUrl(verification.permissions)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Event Permissions</a></li>
          <li><a href={getProxyUrl(verification.layout)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Layout Plan</a></li>
        </ul>
        <div className="mt-2">
          <strong>Photos/Videos:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            {verification.photos.map((url, idx) => (
              <a key={idx} href={getProxyUrl(url)} target="_blank" rel="noopener noreferrer">
                <img src={getProxyUrl(url)} alt={`Photo ${idx + 1}`} className="w-24 h-16 object-cover border" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold">References</h2>
        <ul className="list-disc ml-6">
          {verification.references.map((ref, idx) => (
            <li key={idx}>{ref.name} ({ref.relation}) - {ref.contact}</li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Admin Feedback (required if rejecting):</label>
        <textarea
          className="border rounded w-full p-2"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          rows={3}
          placeholder="Enter feedback if rejecting..."
          disabled={actionLoading}
        />
      </div>
      <div className="flex gap-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={() => handleAction('approved')}
          disabled={actionLoading}
        >
          Approve
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={() => handleAction('rejected')}
          disabled={actionLoading || !feedback.trim()}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default VerificationDetailPage; 