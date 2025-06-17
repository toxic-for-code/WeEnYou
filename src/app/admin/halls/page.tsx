'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Hall {
  _id: string;
  name: string;
  images: string[];
  location: {
    city: string;
    state: string;
  };
  price: number;
  capacity: number;
  verified: boolean;
}

export default function AdminHalls() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifyingHalls, setVerifyingHalls] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);

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
      
      // Get cached verification status
      const cachedStatus = localStorage.getItem('hallVerificationStatus');
      const verificationStatus = cachedStatus ? JSON.parse(cachedStatus) : {};
      
      // Merge the fetched halls with cached verification status
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
      console.log('Starting verification toggle for hall:', hallId);
      console.log('Current verified status:', verified);
      
      setVerifyingHalls(prev => [...prev, hallId]);
      
      const response = await fetch(`/api/admin/halls/${hallId}/verify`, {
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

      const { hall: updatedHall, message } = await response.json();
      console.log('Received updated hall data:', updatedHall);
      console.log('Success message:', message);
      
      if (typeof updatedHall.verified !== 'boolean') {
        console.error('Invalid verification status received:', updatedHall.verified);
        throw new Error('Invalid verification status received from server');
      }

      // Update the hall in the local state
      setHalls(prevHalls => {
        const updatedHalls = prevHalls.map(hall => {
          if (hall._id === hallId) {
            console.log('Updating hall:', hall._id);
            console.log('New verified status:', updatedHall.verified);
            return { ...hall, verified: updatedHall.verified };
          }
          return hall;
        });
        console.log('Updated halls array:', updatedHalls);
        return updatedHalls;
      });

      // Cache the verification status
      const cachedStatus = localStorage.getItem('hallVerificationStatus');
      const verificationStatus = cachedStatus ? JSON.parse(cachedStatus) : {};
      verificationStatus[hallId] = updatedHall.verified;
      localStorage.setItem('hallVerificationStatus', JSON.stringify(verificationStatus));

      // Show success message
      setError(''); // Clear any existing error
    } catch (error) {
      console.error('Error toggling verification:', error);
      setError('Failed to update verification status');
    } finally {
      setVerifyingHalls(prev => prev.filter(id => id !== hallId));
    }
  };

  const updateAllHalls = async () => {
    try {
      setUpdating(true);
      const response = await fetch('/api/admin/halls/update-all', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to update halls');
      }

      const data = await response.json();
      console.log('Update result:', data);
      
      // Refresh the halls list
      await fetchHalls();
      setError('');
    } catch (error) {
      console.error('Error updating halls:', error);
      setError('Failed to update halls');
    } finally {
      setUpdating(false);
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
        <h1 className="text-3xl font-bold">Manage Halls</h1>
        <button
          onClick={updateAllHalls}
          disabled={updating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? 'Updating...' : 'Update All Halls'}
        </button>
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
        {halls.map((hall) => (
          <div key={hall._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image
                src={hall.images[0] || '/placeholder.jpg'}
                alt={hall.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold">{hall.name}</h3>
              <p className="text-gray-600">{hall.location.city}, {hall.location.state}</p>
              <p className="text-gray-600">Capacity: {hall.capacity}</p>
              <p className="text-gray-600">Price: ₹{hall.price}/day</p>
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={() => toggleVerification(hall._id, !hall.verified)}
                  disabled={verifyingHalls.includes(hall._id)}
                  className={`px-4 py-2 rounded ${
                    hall.verified 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  } text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {verifyingHalls.includes(hall._id)
                    ? 'Updating...'
                    : hall.verified
                    ? 'Verified ✓'
                    : 'Verify'}
                </button>
                <Link 
                  href={`/admin/halls/${hall._id}`} 
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