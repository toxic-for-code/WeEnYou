import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log('[Featured API] Starting fetch...');
    await connectDB();
    console.log('[Featured API] Database connected');

    // Get only featured and active halls
    let halls = await Hall.find({ 
      featured: true, 
      status: 'active' 
    })
      .sort({ averageRating: -1, createdAt: -1 })
      .limit(6);

    console.log('[Featured API] Active featured halls found:', halls.length);

    // Debug: if none found, fall back to any featured halls regardless of status,
    // and log useful information to help diagnose data issues.
    if (!halls || halls.length === 0) {
      const allFeatured = await Hall.find({ featured: true })
        .sort({ averageRating: -1, createdAt: -1 })
        .limit(6);
      
      console.warn('[Featured API] No active featured halls found.');
      console.warn(`[Featured API] Counts → active: 0, any-featured: ${allFeatured.length}`);
      
      if (allFeatured.length > 0) {
        console.warn('[Featured API] Example statuses:', allFeatured.map(h => ({ 
          id: h._id.toString(), 
          name: h.name,
          status: h.status, 
          verified: h.verified 
        })));
        halls = allFeatured; // safe fallback to show featured content
      } else {
        // Check if there are any halls at all
        const totalHalls = await Hall.countDocuments();
        const totalFeatured = await Hall.countDocuments({ featured: true });
        console.warn(`[Featured API] Total halls: ${totalHalls}, Total featured: ${totalFeatured}`);
      }
    }

    console.log('[Featured API] Returning halls:', halls.length);
    return NextResponse.json({ halls });
  } catch (error) {
    console.error('[Featured API] Error fetching featured halls:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to fetch featured halls',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}