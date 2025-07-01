'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
  status: string;
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
}

export default function AdminHallDetails({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hall, setHall] = useState<Hall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user?.role !== 'admin') {
      router.push('/');
    } else {
      fetchHallDetails();
    }
  }, [session, status, router, params.id]);

  const fetchHallDetails = async () => {
    try {
      const response = await fetch(`/api/admin/halls/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hall');
      }
      const data = await response.json();
      setHall(data.hall);
    } catch (error) {
      console.error('Error fetching hall details:', error);
      setError('Failed to fetch hall details');
    } finally {
      setLoading(false);
    }
  };

  const deleteHall = async () => {
    if (!confirm('Are you sure you want to delete this hall? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/halls/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete hall');
      }

      router.push('/admin/halls');
    } catch (error) {
      console.error('Error deleting hall:', error);
      setError('Failed to delete hall');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
      </div>
    );
  }

  if (!hall) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Hall not found</h1>
          <Link href="/admin/halls" className="text-primary-600 hover:text-primary-700">
            Back to Halls
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/admin/halls" 
          className="text-primary-600 hover:text-primary-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Halls
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-64 md:h-96">
          <Image
            src={hall.images[0] || '/placeholder.jpg'}
            alt={hall.name}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{hall.name}</h1>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 text-sm rounded-full ${
                hall.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {hall.status}
              </span>
              <span className={`px-3 py-1 text-sm rounded-full ${
                hall.verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {hall.verified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Hall Details</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Price:</span> ₹{hall.price}/day</p>
                <p><span className="font-medium">Capacity:</span> {hall.capacity} people</p>
                <p><span className="font-medium">Rating:</span> {hall.averageRating.toFixed(1)} ⭐ ({hall.totalReviews} reviews)</p>
                <p><span className="font-medium">Created:</span> {new Date(hall.createdAt).toLocaleDateString()}</p>
                <p><span className="font-medium">Last Updated:</span> {new Date(hall.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Address:</span> {hall.location.address}</p>
                <p><span className="font-medium">City:</span> {hall.location.city}</p>
                <p><span className="font-medium">State:</span> {hall.location.state}</p>
                <p><span className="font-medium">Pincode:</span> {hall.location.pincode}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Owner Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {hall.ownerId.name}</p>
              <p><span className="font-medium">Email:</span> {hall.ownerId.email}</p>
              <p><span className="font-medium">Phone:</span> {hall.ownerId.phone}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{hall.description}</p>
          </div>

          {hall.amenities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {hall.amenities.map((amenity, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hall.images.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Additional Images</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hall.images.slice(1).map((image, index) => (
                  <div key={index} className="relative h-32">
                    <Image
                      src={image}
                      alt={`${hall.name} - Image ${index + 2}`}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t">
            <button
              onClick={deleteHall}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete Hall'}
            </button>
            
            <div className="flex space-x-4">
              <Link
                href={`/halls/${hall._id}`}
                target="_blank"
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                View Public Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
 