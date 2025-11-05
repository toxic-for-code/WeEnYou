import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Service from '@/models/Service';
import User from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get all service providers (vendors)
    const vendors = await User.find({ 
      role: 'vendor',
      status: 'active'
    }).select('name email phone businessName').lean();
    
    return NextResponse.json({ 
      vendors,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors', success: false },
      { status: 500 }
    );
  }
}