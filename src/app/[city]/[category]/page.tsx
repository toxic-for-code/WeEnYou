'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';

interface Venue {
  _id: string;
  name: string;
  images: string[];
  location: {
    city: string;
    state: string;
    address: string;
  };
  price: number;
  capacity: number;
}

interface Vendor {
  _id: string;
  name: string;
  businessName: string;
  services: string[];
  images: string[];
}

export default function CityCategory() {
  const params = useParams();
  const city = params.city as string;
  const category = params.category as string;
  
  const [items, setItems] = useState<Venue[] | Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let endpoint = '';
        
        // Determine the correct endpoint based on the category
        if (category === 'vendors') {
          endpoint = `/api/${city}/vendors`;
        } else if (category === 'banquet-halls' || category === 'wedding-lawns' || category === 'venues') {
          endpoint = `/api/${city}/banquet-halls`;
        } else {
          // For other specific categories
          endpoint = `/api/${city}/${category}`;
        }
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${category} in ${city}`);
        }
        
        const data = await response.json();
        
        if (category === 'vendors') {
          setItems(data.vendors || []);
        } else {
          setItems(data.halls || []);
        }
      } catch (err) {
        console.error(`Error fetching ${category} in ${city}:`, err);
        setError(`Failed to load ${category} in ${city}. Please try again later.`);
      } finally {
        setLoading(false);
      }
    };
    
    if (city && category) {
      fetchData();
    }
  }, [city, category]);

  const formatTitle = (text: string) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  const categoryName = formatTitle(category);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{categoryName} in {cityName}</h1>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{categoryName} in {cityName}</h1>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{categoryName} in {cityName}</h1>
      
      {items.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">No {categoryName} found in {cityName}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48 w-full">
                {item.images && item.images.length > 0 ? (
                  <Image
                    src={getImageUrl(item.images[0])}
                    alt={item.name}
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
                <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
                {'location' in item && (
                  <p className="text-gray-600 mb-2">{item.location.address}</p>
                )}
                {'businessName' in item && (
                  <p className="text-gray-600 mb-2">{item.businessName}</p>
                )}
                <Link 
                  href={category === 'vendors' 
                    ? `/services/${item._id}` 
                    : `/halls/${item._id}`
                  }
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