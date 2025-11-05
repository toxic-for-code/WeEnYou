'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';

interface City {
  name: string;
  count: number;
  image?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/cities');
        
        if (!response.ok) {
          throw new Error('Failed to fetch cities');
        }
        
        const data = await response.json();
        
        // Transform the data to include counts
        const citiesWithCounts = await Promise.all(
          data.cities.map(async (cityName: string) => {
            try {
              // For each city, fetch the count of items in the category
              const countResponse = await fetch(`/api/${cityName}/${category === 'venues' ? 'banquet-halls' : category}`);
              const countData = await countResponse.json();
              
              const count = category === 'vendors' 
                ? (countData.vendors?.length || 0)
                : (countData.halls?.length || 0);
              
              return {
                name: cityName,
                count,
                // You could add a representative image for each city here
              };
            } catch (err) {
              console.error(`Error fetching count for ${cityName}:`, err);
              return {
                name: cityName,
                count: 0,
              };
            }
          })
        );
        
        // Filter out cities with zero count
        setCities(citiesWithCounts.filter(city => city.count > 0));
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError('Failed to load cities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (category) {
      fetchData();
    }
  }, [category]);

  const formatTitle = (text: string) => {
    return text
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const categoryName = formatTitle(category);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{categoryName} Across India</h1>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{categoryName} Across India</h1>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{categoryName} Across India</h1>
      
      {cities.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">No {categoryName.toLowerCase()} found in any city.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <Link 
              key={city.name} 
              href={`/${city.name}/${category}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 w-full">
                {city.image ? (
                  <Image
                    src={getImageUrl(city.image)}
                    alt={city.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <p className="text-2xl font-bold text-gray-500">{city.name.charAt(0).toUpperCase() + city.name.slice(1)}</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{city.name.charAt(0).toUpperCase() + city.name.slice(1)}</h2>
                <p className="text-gray-600">{city.count} {categoryName.toLowerCase()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

