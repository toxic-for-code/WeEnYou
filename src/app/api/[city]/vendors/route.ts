import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Service from '@/models/Service';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ city: string }> }
) {
  try {
    const { city } = await params;
    
    // Normalize city name - handle URL encoding and case variations
    const normalizedCity = decodeURIComponent(city).toLowerCase();
    
    await connectToDatabase();
    
    // Find vendors who have services in this city (case-insensitive search)
    // Note: Service model uses 'city' field directly, not 'location.city'
    const services = await Service.find({
      $or: [
        { city: { $regex: new RegExp(`^${normalizedCity}$`, 'i') } },
        { city: normalizedCity }
      ],
      status: 'active'
    }).select('providerId').lean();
    
    const vendorIds = Array.from(new Set(services.map(service => service.providerId?.toString()).filter(Boolean)));
    
    const vendors = await User.find({
      _id: { $in: vendorIds },
      status: 'active'
    }).select('name email phone businessName').lean();
    
    return NextResponse.json({ 
      vendors,
      success: true 
    });
  } catch (error) {
    console.error(`Error fetching vendors for city:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors', success: false },
      { status: 500 }
    );
  }
}