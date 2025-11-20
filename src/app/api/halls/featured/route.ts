import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectDB();

    // Get only featured and active halls
    let halls = await Hall.find({ 
      featured: true, 
      status: 'active' 
    })
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(6);

    // If none found, fall back to any featured halls regardless of status
    if (!halls || halls.length === 0) {
      const allFeatured = await Hall.find({ featured: true })
        .sort({ averageRating: -1, createdAt: -1 })
        .limit(6);
      
      if (allFeatured.length > 0) {
        halls = allFeatured; // safe fallback to show featured content
      }
    }

    return NextResponse.json({ halls });
  } catch (error) {
    console.error('Error fetching featured halls:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch featured halls'
    }, { status: 500 });
  }
}