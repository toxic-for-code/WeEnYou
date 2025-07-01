'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
}

export default function AdminServices() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyingServices, setVerifyingServices] = useState<string[]>([]);

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
      
      // Get cached verification status
      const cachedStatus = localStorage.getItem('serviceVerificationStatus');
      const verificationStatus = cachedStatus ? JSON.parse(cachedStatus) : {};
      
      // Merge the fetched services with cached verification status
      const updatedServices = data.services.map((service: Service) => ({
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
      console.log('Starting verification toggle for service:', serviceId);
      console.log('Current verified status:', verified);
      
      setVerifyingServices(prev => [...prev, serviceId]);
      
      const response = await fetch(`/api/admin/services/${serviceId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error('Failed to update verification status');
      }

      const { service: updatedService, message } = await response.json();
      console.log('Received updated service data:', updatedService);
      console.log('Success message:', message);
      
      if (typeof updatedService.verified !== 'boolean') {
        console.error('Invalid verification status received:', updatedService.verified);
        throw new Error('Invalid verification status received from server');
      }

      // Update the service in the local state
      setServices(prevServices => {
        const updatedServices = prevServices.map(service => {
          if (service._id === serviceId) {
            console.log('Updating service:', service._id);
            console.log('New verified status:', updatedService.verified);
            return { ...service, verified: updatedService.verified };
          }
          return service;
        });
        console.log('Updated services array:', updatedServices);
        return updatedServices;
      });

      // Cache the verification status
      const cachedStatus = localStorage.getItem('serviceVerificationStatus');
      const verificationStatus = cachedStatus ? JSON.parse(cachedStatus) : {};
      verificationStatus[serviceId] = updatedService.verified;
      localStorage.setItem('serviceVerificationStatus', JSON.stringify(verificationStatus));

      // Show success message
      setError(''); // Clear any existing error
    } catch (error) {
      console.error('Error toggling verification:', error);
      setError('Failed to update verification status');
    } finally {
      setVerifyingServices(prev => prev.filter(id => id !== serviceId));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Services</h1>
      </div>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image
                src={service.images[0] || '/placeholder.jpg'}
                alt={service.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{service.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {service.status}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{service.serviceType}</p>
              <p className="text-gray-600 mb-2">{service.city}, {service.state}</p>
              <p className="text-gray-600 mb-2">Price: ₹{service.price}</p>
              <p className="text-gray-600 mb-2">Contact: {service.contact}</p>
              <p className="text-gray-600 mb-4 text-sm">
                Provider: {service.providerId.name} ({service.providerId.email})
              </p>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {service.description}
              </p>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => toggleVerification(service._id, !service.verified)}
                  disabled={verifyingServices.includes(service._id)}
                  className={`px-4 py-2 rounded ${
                    service.verified 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  } text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {verifyingServices.includes(service._id)
                    ? 'Updating...'
                    : service.verified
                    ? 'Verified ✓'
                    : 'Verify'}
                </button>
                <Link 
                  href={`/admin/services/${service._id}`} 
                  className="text-primary-600 hover:text-primary-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 