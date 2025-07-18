'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';

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
  featured: boolean;
  platformFeePercent?: number;
}

export default function AdminHalls() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifyingHalls, setVerifyingHalls] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [approvingHalls, setApprovingHalls] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'featured'>('all');
  const [togglingFeatured, setTogglingFeatured] = useState<string[]>([]);
  // Commission percent editing state
  const [platformFeeEdits, setPlatformFeeEdits] = useState<{[id: string]: number}>({});
  const [savingPlatformFee, setSavingPlatformFee] = useState<string | null>(null);

  // Check URL parameters for tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'pending') {
      setActiveTab('pending');
    }
  }, []);

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

  const approveHall = async (hallId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setApprovingHalls(prev => [...prev, hallId]);
      
      const response = await fetch(`/api/admin/halls/${hallId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update hall status');
      }

      const { hall: updatedHall, message } = await response.json();
      
      // Update the hall in the local state
      setHalls(prevHalls => 
        prevHalls.map(hall => 
          hall._id === hallId ? { ...hall, status: updatedHall.status, verified: updatedHall.verified } : hall
        )
      );

      setError(''); // Clear any existing error
      setSuccess(message); // Show success message
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      console.error('Error approving/rejecting hall:', error);
      setError(error.message || 'Failed to update hall status');
    } finally {
      setApprovingHalls(prev => prev.filter(id => id !== hallId));
    }
  };

  const handleVerifyHall = async (hallId: string) => {
    if (verifyingHalls.includes(hallId)) return;
    
    setVerifyingHalls(prev => [...prev, hallId]);
    try {
      const response = await fetch(`/api/admin/halls/${hallId}/verify`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setSuccess('Hall verification status updated successfully');
        fetchHalls();
      } else {
        setError('Failed to update hall verification status');
      }
    } catch (error) {
      setError('Error updating hall verification status');
    } finally {
      setVerifyingHalls(prev => prev.filter(id => id !== hallId));
    }
  };

  const handleToggleFeatured = async (hallId: string, currentFeatured: boolean) => {
    if (togglingFeatured.includes(hallId)) return;
    
    setTogglingFeatured(prev => [...prev, hallId]);
    try {
      const response = await fetch(`/api/admin/halls/${hallId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !currentFeatured }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message || 'Featured status updated successfully');
        fetchHalls();
      } else {
        setError('Failed to update featured status');
      }
    } catch (error) {
      setError('Error updating featured status');
    } finally {
      setTogglingFeatured(prev => prev.filter(id => id !== hallId));
    }
  };

  // Save platform fee percent for a hall
  const savePlatformFee = async (hallId: string) => {
    setSavingPlatformFee(hallId);
    try {
      const percent = platformFeeEdits[hallId];
      const res = await fetch(`/api/admin/halls/${hallId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platformFeePercent: percent }),
      });
      if (!res.ok) throw new Error('Failed to update platform fee');
      await fetchHalls();
      setSuccess('Platform fee updated');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update platform fee');
    } finally {
      setSavingPlatformFee(null);
    }
  };

  // Approve with platform fee prompt
  const approveHallWithPlatformFee = async (hallId: string) => {
    let percent = prompt('Enter platform fee percent (e.g. 10, 15, 20):', '10');
    if (!percent) return;
    percent = percent.replace(/[^0-9.]/g, '');
    const num = Number(percent);
    if (isNaN(num) || num < 0 || num > 100) {
      alert('Invalid platform fee percent');
      return;
    }
    setApprovingHalls(prev => [...prev, hallId]);
    try {
      const response = await fetch(`/api/admin/halls/${hallId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', platformFeePercent: num }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve hall');
      }
      const { hall: updatedHall, message } = await response.json();
      setHalls(prevHalls => prevHalls.map(hall => hall._id === hallId ? { ...hall, status: updatedHall.status, verified: updatedHall.verified, platformFeePercent: updatedHall.platformFeePercent } : hall));
      setError('');
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to approve hall');
    } finally {
      setApprovingHalls(prev => prev.filter(id => id !== hallId));
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Halls
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Pending Approval ({halls.filter(h => h.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('featured')}
            className={`${
              activeTab === 'featured'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Featured Halls
          </button>
        </nav>
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
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {halls
          .filter(hall => {
            if (activeTab === 'all') return true;
            if (activeTab === 'pending') return hall.status === 'pending';
            if (activeTab === 'featured') return hall.featured === true;
            return true;
          })
          .map((hall) => (
          <div key={hall._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image
                src={getImageUrl(hall.images[0] || '/placeholder.jpg')}
                alt={hall.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{hall.name}</h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    hall.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {hall.status}
                  </span>
                  {hall.featured && (
                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                      Featured
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-2">{hall.location.address}</p>
              <p className="text-gray-600 mb-2">{hall.location.city}, {hall.location.state} - {hall.location.pincode}</p>
              <p className="text-gray-600 mb-2">Capacity: {hall.capacity} people</p>
              <p className="text-gray-600 mb-2">Price: ₹{hall.price}/day</p>
              <p className="text-gray-600 mb-2">Platform Fee: {hall.platformFeePercent}%</p>
              <div className="flex items-center gap-2 mb-2">
                {/* Remove the input and Save button for platform fee in the card/list view. Only display: */}
                {/* <input
                  type="number"
                  min={0}
                  max={100}
                  value={platformFeeEdits[hall._id] ?? hall.platformFeePercent ?? 10}
                  onChange={e => setPlatformFeeEdits(edits => ({ ...edits, [hall._id]: Number(e.target.value) }))}
                  className="w-20 border rounded px-2 py-1 text-sm"
                  disabled={savingPlatformFee === hall._id}
                /> */}
                {/* <button
                  onClick={() => savePlatformFee(hall._id)}
                  disabled={savingPlatformFee === hall._id}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs disabled:opacity-50"
                >{savingPlatformFee === hall._id ? 'Saving...' : 'Save'}</button> */}
              </div>
              <p className="text-gray-600 mb-2">Rating: {hall.averageRating.toFixed(1)} ⭐ ({hall.totalReviews} reviews)</p>
              <p className="text-gray-600 mb-4 text-sm">
                Owner: {hall.ownerId.name} ({hall.ownerId.email})
              </p>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {hall.description}
              </p>
              {hall.amenities.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-600 text-sm font-medium mb-1">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {hall.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {amenity}
                      </span>
                    ))}
                    {hall.amenities.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{hall.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-4 flex justify-between items-center">
                {hall.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveHallWithPlatformFee(hall._id)}
                      disabled={approvingHalls.includes(hall._id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approvingHalls.includes(hall._id) ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => approveHall(hall._id, 'reject')}
                      disabled={approvingHalls.includes(hall._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approvingHalls.includes(hall._id) ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                ) : (
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
                )}
                <div className="flex gap-2">
                  {hall.status === 'active' && (
                    <button
                      onClick={() => handleToggleFeatured(hall._id, hall.featured)}
                      disabled={togglingFeatured.includes(hall._id)}
                      className={`px-3 py-2 text-sm rounded ${
                        hall.featured
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      } disabled:opacity-50`}
                    >
                      {togglingFeatured.includes(hall._id) ? 'Updating...' : hall.featured ? 'Remove Featured' : 'Mark Featured'}
                    </button>
                  )}
                  <Link 
                    href={`/admin/halls/${hall._id}`} 
                    className="text-primary-600 hover:text-primary-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
 