import { Metadata } from 'next';
import { connectToDatabase } from '@/lib/db';
import Hall from '@/models/Hall';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';

export const revalidate = 600; // Revalidate every 10 minutes (ISR)

export const metadata: Metadata = {
  title: 'Best Banquet Halls in Mumbai | WeEnYou',
  description: 'Discover the best banquet halls in Mumbai for weddings, parties, and events. Compare prices, capacities, and amenities. Book your perfect venue today!',
  keywords: 'banquet halls mumbai, wedding venues mumbai, party halls mumbai, event venues mumbai',
  openGraph: {
    title: 'Best Banquet Halls in Mumbai | WeEnYou',
    description: 'Discover the best banquet halls in Mumbai for weddings, parties, and events.',
    type: 'website',
  },
};

interface Hall {
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

async function getMumbaiBanquetHalls(): Promise<Hall[]> {
  try {
    await connectToDatabase();
    
    const halls = await Hall.find({
      $or: [
        { 'location.city': { $regex: /^mumbai$/i } },
        { 'location.city': 'mumbai' }
      ],
      status: 'active'
    })
      .select('name images location price capacity')
      .lean()
      .limit(50);
    
    return halls as Hall[];
  } catch (error) {
    console.error('Error fetching Mumbai banquet halls:', error);
    // Return empty array if database connection fails
    return [];
  }
}

export default async function MumbaiBanquetHallsPage() {
  const halls = await getMumbaiBanquetHalls();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Banquet Halls in Mumbai</h1>
        <p className="text-lg text-gray-600 mb-4">
          Discover the finest banquet halls in Mumbai for your special events. From intimate gatherings to grand celebrations, find the perfect venue that matches your style and budget.
        </p>
        <p className="text-gray-600">
          {halls.length} {halls.length === 1 ? 'venue' : 'venues'} available
        </p>
      </div>

      {halls.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">No banquet halls found in Mumbai at the moment. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall) => (
            <div key={hall._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 w-full">
                {hall.images && hall.images.length > 0 ? (
                  <Image
                    src={getImageUrl(hall.images[0])}
                    alt={hall.name}
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
                <h2 className="text-xl font-semibold mb-2">{hall.name}</h2>
                <p className="text-gray-600 mb-2 text-sm">{hall.location.address}</p>
                <p className="text-gray-800 font-medium mb-2">₹{hall.price.toLocaleString()} onwards</p>
                <p className="text-gray-600 mb-4 text-sm">Capacity: {hall.capacity} guests</p>
                <Link 
                  href={`/halls/${hall._id}`}
                  className="inline-block text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Why Choose Banquet Halls in Mumbai?</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Premium venues with world-class facilities</li>
          <li>Prime locations across the city with easy accessibility</li>
          <li>Modern amenities and professional event management</li>
          <li>Flexible packages to suit all budgets</li>
        </ul>
      </div>
    </div>
  );
}

