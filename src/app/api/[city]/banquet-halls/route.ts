import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Hall from '@/models/Hall';

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
    
    // Find banquet halls in this city (case-insensitive search)
    const halls = await Hall.find({
      $or: [
        { 'location.city': { $regex: new RegExp(`^${normalizedCity}$`, 'i') } },
        { 'location.city': normalizedCity }
      ],
      status: 'active'
    }).select('name images location price capacity').lean();
    
    return NextResponse.json({ 
      halls,
      success: true 
    });
  } catch (error) {
    console.error(`Error fetching banquet halls for city:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch banquet halls', success: false },
      { status: 500 }
    );
  }
}