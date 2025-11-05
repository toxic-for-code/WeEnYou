import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Hall from '@/models/Hall';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Aggregate halls by city to get a list of all cities
    const cities = await Hall.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$location.city' } },
      { $sort: { _id: 1 } }
    ]);
    
    return NextResponse.json({ 
      cities: cities.map(city => city._id),
      success: true 
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities', success: false },
      { status: 500 }
    );
  }
}