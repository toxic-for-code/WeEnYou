'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';
import { 
  WrenchScrewdriverIcon, 
  MapPinIcon, 
  BanknotesIcon, 
  UserIcon, 
  CheckBadgeIcon, 
  ChevronLeftIcon,
  TrashIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  TagIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface Service {
  _id: string;
  serviceType: string;
  name: string;
  description: string;
  price: number;
  contact: string;
  city: string;
  state: string;
  images: string[];
  verified: boolean;
  status: string;
  providerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminServiceDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchService();
    }
  }, [session, status, router, params.id]);

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/admin/services/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch service');
      const data = await response.json();
      setService(data.service);
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Failed to fetch service details');
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async () => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;
    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/services/${params.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete service');
      router.push('/admin/services');
    } catch (error) {
      setError('Failed to delete service');
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

  if (!service) {
    return (
      <div className="text-center py-20">
         <WrenchScrewdriverIcon className="w-12 h-12 text-gray-200 mx-auto" />
         <p className="text-gray-400 font-medium mt-4">Service not found.</p>
         <Link href="/admin/services" className="text-[#C89B3C] font-bold mt-2 inline-block">Back to Services</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/services" className="p-2 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-gray-900 shadow-sm transition-all">
            <ChevronLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{service.name}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
               <span>Admin</span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span>Services</span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span className="text-[#B38A34]">{service.serviceType}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Link href={`/services/${service._id}`} target="_blank" className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-all border border-gray-100 flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4" />
              View Public
           </Link>
           <button onClick={deleteService} disabled={deleting} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all border border-red-100 flex items-center gap-2 disabled:opacity-50">
              <TrashIcon className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete Service'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="relative h-80">
                <Image
                  src={getImageUrl(service.images[0] || '/placeholder.jpg')}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-6 left-6 flex gap-2">
                   <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20 theme-shadow ${
                      service.status === 'active' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                   }`}>
                      {service.status}
                   </span>
                   {service.verified && (
                      <span className="px-4 py-1.5 rounded-full bg-[#C89B3C]/90 text-white text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                         <ShieldCheckIcon className="w-4 h-4" />
                         Verified
                      </span>
                   )}
                </div>
              </div>
              <div className="p-8">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Service Type</p>
                       <p className="text-sm font-bold text-gray-900 capitalize">{service.serviceType}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Starting Price</p>
                       <p className="text-sm font-bold text-gray-900">₹{service.price?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                       <p className="text-sm font-bold text-gray-900">{service.city}, {service.state}</p>
                    </div>
                 </div>

                 <div className="mt-8">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <InformationCircleIcon className="w-3.5 h-3.5" />
                       About Service
                    </h4>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{service.description}</p>
                 </div>
              </div>
           </div>

           {/* Image Gallery */}
           {service.images.length > 1 && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Service Gallery
                 </h4>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {service.images.slice(1).map((image, index) => (
                       <div key={index} className="relative h-28 rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <Image
                             src={getImageUrl(image)}
                             alt={`${service.name} - Image ${index + 2}`}
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
           {/* Provider Card */}
           <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <UserIcon className="w-3.5 h-3.5" />
                 Provider Profile
              </h4>
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center font-bold text-xl text-[#C89B3C]">
                    {service.providerId?.name.charAt(0)}
                 </div>
                 <div>
                    <p className="font-bold text-gray-900 leading-none">{service.providerId?.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">Verified Partner</p>
                 </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-50">
                 <div className="flex items-center gap-3 text-xs text-gray-600">
                    <p className="font-medium truncate">{service.providerId?.email}</p>
                 </div>
                 <div className="flex items-center gap-3 text-xs text-gray-600">
                    <p className="font-medium">{service.providerId?.phone}</p>
                 </div>
              </div>
           </div>

           {/* Timeline Card */}
           <div className="bg-gray-900 rounded-3xl p-8 shadow-xl shadow-gray-900/10 text-white space-y-6">
              <div>
                 <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-2">History</h4>
                 <p className="text-xl font-bold">Timeline</p>
              </div>
              <div className="space-y-4">
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Created Date</p>
                    <p className="text-sm font-bold text-gold">{new Date(service.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                 </div>
                 <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Last Modified</p>
                    <p className="text-sm font-bold text-white/90">{new Date(service.updatedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}