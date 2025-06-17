'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  providerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  images?: string[];
  verified: boolean;
  createdAt: string;
}

export default function AdminServices() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      setServices(data.services);
    } catch (err) {
      setError('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationToggle = async (serviceId: string) => {
    try {
      const res = await fetch(`/api/admin/services/${serviceId}/verify`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to toggle verification');
      
      // Update the services list with the updated service
      const data = await res.json();
      setServices(services.map(service => 
        service._id === serviceId ? data.service : service
      ));
    } catch (err) {
      setError('Failed to update service verification status');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete service');
      
      // Remove the deleted service from the list
      setServices(services.filter(service => service._id !== serviceId));
    } catch (err) {
      setError('Failed to delete service');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Services</h1>
      <div className="grid gap-6">
        {services.map((service) => (
          <div key={service._id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/4">
                {service.images && service.images.length > 0 && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={service.images[0]}
                      alt={service.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{service.name}</h2>
                    <p className="text-gray-600">{service.category}</p>
                  </div>
                  <p className="text-lg font-semibold">₹{service.price}</p>
                </div>
                <p className="mt-2 text-gray-700">{service.description}</p>
                <div className="mt-4">
                  <h3 className="font-semibold">Provider Information</h3>
                  <p>{service.providerId.name}</p>
                  <p>{service.providerId.email}</p>
                  <p>{service.providerId.phone}</p>
                </div>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleVerificationToggle(service._id)}
                    className={`px-4 py-2 rounded ${
                      service.verified
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-yellow-600 hover:bg-yellow-700'
                    } text-white`}
                  >
                    {service.verified ? 'Verified ✓' : 'Mark as Verified'}
                  </button>
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Service
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 