import { Metadata } from 'next';
import { connectToDatabase } from '@/lib/db';
import Service from '@/models/Service';
import User from '@/models/User';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUtils';

export const revalidate = 600; // Revalidate every 10 minutes (ISR)

export const metadata: Metadata = {
  title: 'Best Caterers in Delhi | WeEnYou',
  description: 'Find the best caterers in Delhi for your events. Professional catering services with delicious food and excellent service. Book now!',
  keywords: 'caterers delhi, catering services delhi, event caterers delhi, wedding caterers delhi',
  openGraph: {
    title: 'Best Caterers in Delhi | WeEnYou',
    description: 'Find the best caterers in Delhi for your events.',
    type: 'website',
  },
};

interface Vendor {
  _id: string;
  name: string;
  businessName?: string;
  email: string;
  phone?: string;
}

async function getDelhiCaterers(): Promise<Vendor[]> {
  try {
    await connectToDatabase();
    
    // Find services with caterer type in Delhi
    const services = await Service.find({
      $or: [
        { city: { $regex: /^delhi$/i } },
        { city: 'delhi' },
        { city: 'Delhi' }
      ],
      serviceType: { $regex: /cater/i },
      status: 'active'
    })
      .select('providerId')
      .lean();
    
    const vendorIds = [...new Set(services.map((s: any) => s.providerId?.toString()).filter(Boolean))];
    
    if (vendorIds.length === 0) {
      return [];
    }
    
    const vendors = await User.find({
      _id: { $in: vendorIds },
      status: 'active'
    })
      .select('name email phone businessName')
      .lean()
      .limit(50);
    
    // Filter out any null/undefined vendors and ensure they have a name
    return (vendors as Vendor[]).filter(vendor => vendor && vendor._id && vendor.name);
  } catch (error) {
    console.error('Error fetching Delhi caterers:', error);
    // Return empty array if database connection fails
    return [];
  }
}

export default async function DelhiCaterersPage() {
  const caterers = await getDelhiCaterers();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Caterers in Delhi</h1>
        <p className="text-lg text-gray-600 mb-4">
          Find the best catering services in Delhi for your weddings, parties, and corporate events. From traditional to modern cuisine, we have the perfect caterer for you.
        </p>
        <p className="text-gray-600">
          {caterers.length} {caterers.length === 1 ? 'caterer' : 'caterers'} available
        </p>
      </div>

      {caterers.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <p className="text-yellow-700">No caterers found in Delhi at the moment. Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caterers.map((caterer) => (
            <div key={caterer._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow p-6">
              <h2 className="text-xl font-semibold mb-2">{caterer?.businessName || caterer?.name || 'Caterer'}</h2>
              {caterer?.name && (
                <p className="text-gray-600 mb-2">{caterer.name}</p>
              )}
              {caterer.phone && (
                <p className="text-gray-600 mb-4 text-sm">Phone: {caterer.phone}</p>
              )}
              <Link 
                href={`/vendors/delhi`}
                className="inline-block text-primary-600 hover:text-primary-700 font-medium"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Why Choose Caterers in Delhi?</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Diverse cuisines from North Indian to International fare</li>
          <li>Experienced chefs with years of expertise</li>
          <li>Hygienic food preparation and professional service</li>
          <li>Customizable menus to suit your budget and preferences</li>
        </ul>
      </div>
    </div>
  );
}

