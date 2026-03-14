'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  MapPinIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  DocumentTextIcon,
  PhotoIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  ScaleIcon,
  ClipboardDocumentCheckIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

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

  const getProxyUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `/api/aws-file-proxy${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C89B3C]"></div>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="text-center py-20">
         <ShieldCheckIcon className="w-12 h-12 text-gray-200 mx-auto" />
         <p className="text-gray-400 font-medium mt-4">Verification request not found.</p>
         <Link href="/admin/verifications" className="text-[#C89B3C] font-bold mt-2 inline-block">Back to List</Link>
      </div>
    );
  }

  const documentList = [
    { label: 'Government ID', value: verification.govtId, icon: IdentificationIcon },
    { label: 'Ownership Proof', value: verification.ownershipProof, icon: DocumentTextIcon },
    { label: 'Business License', value: verification.businessCert, icon: ScaleIcon },
    { label: 'GST Certificate', value: verification.gst, icon: DocumentTextIcon },
    { label: 'PAN Card', value: verification.pan, icon: IdentificationIcon },
    { label: 'Bank Statement', value: verification.bankProof, icon: BanknotesIcon },
    { label: 'Fire Safety Cert', value: verification.fireCert, icon: ShieldCheckIcon },
    { label: 'Occupancy Cert', value: verification.occupancyCert, icon: BuildingOfficeIcon },
    { label: 'Event Permissions', value: verification.permissions, icon: ClipboardDocumentCheckIcon },
    { label: 'Layout Plan', value: verification.layout, icon: MapPinIcon },
  ].filter(doc => doc.value);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/verifications" className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-gray-900 shadow-sm transition-all">
          <ChevronLeftIcon className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification Audit</h1>
          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
             <span>Admin</span>
             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
             <span>Verifications</span>
             <span className="w-1 h-1 rounded-full bg-gray-300"></span>
             <span className="text-[#C89B3C]">#{verification._id.slice(-6)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <BuildingOfficeIcon className="w-4 h-4" />
                 Venue & Owner
              </h4>
              <div className="space-y-4">
                 <div>
                    <p className="text-lg font-bold text-gray-900 leading-tight">{verification.venueName}</p>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                       <MapPinIcon className="w-3.5 h-3.5" />
                       {verification.venueAddress}
                    </div>
                 </div>
                 <div className="pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center font-bold text-sm text-[#C89B3C]">
                          {verification.ownerName.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-gray-900 leading-none text-sm">{verification.ownerName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{verification.contact}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <UserIcon className="w-4 h-4" />
                 Personal References
              </h4>
              <div className="space-y-4">
                 {verification.references.map((ref, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                       <div className="p-2 bg-white rounded-lg shadow-xs"><UserIcon className="w-4 h-4 text-gray-400" /></div>
                       <div>
                          <p className="text-xs font-bold text-gray-900">{ref.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{ref.relation}</p>
                          <p className="text-[10px] text-gray-500 font-medium mt-1">{ref.contact}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <DocumentTextIcon className="w-4 h-4" />
                 Submitted Documents
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {documentList.map((doc, idx) => (
                    <a 
                      key={idx} 
                      href={getProxyUrl(doc.value || '')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:border-[#C89B3C] hover:shadow-lg hover:shadow-[#C89B3C]/5 transition-all"
                    >
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl shadow-xs group-hover:bg-gold/10 transition-colors">
                             <doc.icon className="w-5 h-5 text-gray-400 group-hover:text-[#C89B3C]" />
                          </div>
                          <span className="text-xs font-bold text-gray-700 group-hover:text-gray-900">{doc.label}</span>
                       </div>
                       <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-300 group-hover:text-[#C89B3C] transition-colors" />
                    </a>
                 ))}
              </div>

              <div className="mt-12 space-y-6">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <PhotoIcon className="w-4 h-4" />
                    Visual Media
                 </h4>
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {verification.photos.map((url, idx) => (
                       <a key={idx} href={getProxyUrl(url)} target="_blank" rel="noopener noreferrer" className="relative h-28 rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all">
                          <img src={getProxyUrl(url)} alt="" className="w-full h-full object-cover" />
                       </a>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-[#1A1C21] rounded-3xl p-8 shadow-xl shadow-gray-900/10 text-white">
              <div className="flex flex-col md:flex-row gap-8">
                 <div className="flex-1 space-y-6">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <InformationCircleIcon className="w-4 h-4" />
                       Final Review
                    </h4>
                    <div className="space-y-4">
                       <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Admin Notes & Feedback</p>
                          <textarea
                             className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/50 transition-all resize-none"
                             value={feedback}
                             onChange={e => setFeedback(e.target.value)}
                             rows={4}
                             placeholder="Provide context for approval or reasons for rejection..."
                             disabled={actionLoading}
                          />
                       </div>
                    </div>
                 </div>
                 <div className="md:w-64 space-y-3 flex flex-col justify-end">
                    <button
                       onClick={() => handleAction('approved')}
                       disabled={actionLoading}
                       className="w-full py-4 bg-[#C89B3C] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#B38A34] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       {actionLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                       Approve Request
                    </button>
                    <button
                       onClick={() => handleAction('rejected')}
                       disabled={actionLoading || !feedback.trim()}
                       className="w-full py-4 bg-white/5 text-red-400 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-950/20 hover:border-red-900/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                       <XCircleIcon className="w-4 h-4" />
                       Reject Request
                    </button>
                 </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                 <span>Verification System v2.0</span>
                 <span>Security Cleared</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDetailPage;
