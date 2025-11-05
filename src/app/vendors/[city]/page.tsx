'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';

interface Vendor {
  _id: string;
  name: string;
  businessName: string;
  services: string[];
  images: string[];
}

export default function VendorsCityPage() {
  const params = useParams();
  const city = params.city as string;
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/${city}/vendors`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch vendors in ${city}`);
        }
        
        const data = await response.json();
        setVendors(data.vendors || []);
      } catch (err) {
        console.error(`Error fetching vendors in ${city}:`, err);
        setError(`Failed to load vendors in ${city}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };
    
    if (city) {
      fetchData();
    }
  }, [city]);

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Vendors in {cityName}</h1>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Vendors in {cityName}</h1>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Vendors in {cityName}</h1>
      
      {vendors.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">No vendors found in {cityName}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <div key={vendor._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48 w-full">
                {vendor.images && vendor.images.length > 0 ? (
                  <Image
                    src={getImageUrl(vendor.images[0])}
                    alt={vendor.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{vendor.businessName || vendor.name}</h2>
                {vendor.services && vendor.services.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {vendor.services.slice(0, 3).map((service, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                          {service}
                        </span>
                      ))}
                      {vendor.services.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                          +{vendor.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <Link 
                  href={`/services/${vendor._id}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}