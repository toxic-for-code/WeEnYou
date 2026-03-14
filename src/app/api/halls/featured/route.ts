import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    let limit = 6;
    if (limitParam === 'all') {
      limit = 0; // In Mongoose, limit(0) is equivalent to no limit
    } else if (limitParam) {
      limit = parseInt(limitParam) || 6;
    }

    // Get featured and active halls
    let query = Hall.find({ 
      featured: true, 
      status: 'active' 
    })
      .sort({ averageRating: -1, createdAt: -1 });
    
    if (limit > 0) {
      query = query.limit(limit);
    }

    let halls = await query;

    // If none found, fall back to any featured halls regardless of status
    if (!halls || halls.length === 0) {
      let fallbackQuery = Hall.find({ featured: true })
        .sort({ averageRating: -1, createdAt: -1 });
      
      if (limit > 0) {
        fallbackQuery = fallbackQuery.limit(limit);
      }
      
      const allFeatured = await fallbackQuery;
      
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