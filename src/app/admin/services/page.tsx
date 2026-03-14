'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';
import { 
  BuildingStorefrontIcon, 
  CheckBadgeIcon, 
  MapPinIcon, 
  UserIcon, 
  BanknotesIcon,
  StarIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  TagIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

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
  status: 'active' | 'inactive';
  providerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export default function AdminServices() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyingServices, setVerifyingServices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchServices();
    }
  }, [session, status, router]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services');
      const data = await response.json();
      
      const cachedStatus = localStorage.getItem('serviceVerificationStatus');
      const verificationStatus = cachedStatus ? JSON.parse(cachedStatus) : {};
      
      const updatedServices = (data.services || []).map((service: Service) => ({
        ...service,
        verified: verificationStatus[service._id] ?? service.verified
      }));
      
      setServices(updatedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (serviceId: string, verified: boolean) => {
    try {
      setVerifyingServices(prev => [...prev, serviceId]);
      
      const response = await fetch(`/api/admin/services/${serviceId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to update verification status');

      const { service: updatedService } = await response.json();

      setServices(prevServices => prevServices.map(service => 
        service._id === serviceId ? { ...service, verified: updatedService.verified } : service
      ));

      const cachedStatus = localStorage.getItem('serviceVerificationStatus');
      const verificationStatus = cachedStatus ? JSON.parse(cachedStatus) : {};
      verificationStatus[serviceId] = updatedService.verified;
      localStorage.setItem('serviceVerificationStatus', JSON.stringify(verificationStatus));

      setError('');
    } catch (error) {
      setError('Failed to update verification status');
    } finally {
      setVerifyingServices(prev => prev.filter(id => id !== serviceId));
    }
  };

  const types = ['all', ...Array.from(new Set(services.map(s => s.serviceType)))];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          service.providerId?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || service.serviceType === selectedType;
    return matchesSearch && matchesType;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Manage Services</h1>
          <p className="text-gray-500 text-sm mt-1">Review and verify vendor services, catering, and event supplies.</p>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search services or providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#C89B3C]/10 focus:border-[#C89B3C] transition-all text-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {types.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                selectedType === type 
                  ? 'bg-[#C89B3C] text-white shadow-md' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-700 text-sm">
          <XMarkIcon className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
               <Image
                src={getImageUrl(service.images[0] || '/placeholder.jpg')}
                alt={service.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                 <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg border border-white/20 backdrop-blur-md ${
                    service.status === 'active' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                 }`}>
                    {service.status}
                 </span>
              </div>
              {service.verified && (
                <div className="absolute top-4 right-4">
                  <CheckBadgeIcon className="w-8 h-8 text-[#C89B3C] drop-shadow-lg" />
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                 <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                    {service.serviceType}
                 </div>
              </div>
            </div>

            <div className="p-6">
               <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#C89B3C] transition-colors leading-tight">{service.name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <MapPinIcon className="w-3 h-3" />
                    <span>{service.city}, {service.state}</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <BanknotesIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pricing</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">₹{service.price?.toLocaleString()}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <StarIcon className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ratings</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">4.8 <span className="text-[10px] font-normal text-gray-400">(24)</span></p>
                  </div>
               </div>

               <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                        {service.providerId?.name.charAt(0)}
                     </div>
                     <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{service.providerId?.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{service.providerId?.email}</p>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => toggleVerification(service._id, !service.verified)}
                    disabled={verifyingServices.includes(service._id)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                      service.verified 
                        ? 'bg-green-50 border-green-100 text-green-600 hover:bg-green-100' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    } disabled:opacity-50`}
                  >
                    {verifyingServices.includes(service._id) ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : service.verified ? <CheckBadgeIcon className="w-4 h-4" /> : <CheckCircleIconSolid className="w-4 h-4 text-gray-300" />}
                    {service.verified ? 'Verified' : 'Verify'}
                  </button>
                  <Link 
                    href={`/admin/services/${service._id}`} 
                    className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-xl border border-gray-100 transition-all"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </Link>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}