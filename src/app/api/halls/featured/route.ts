import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';

// Clean, stable featured halls route with optional debug mode
export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const debugMode = url.searchParams.get('debug') === '1';

    const filter = { featured: true };

    // Use a straightforward query without accidental filters or sorting
    const halls = await Hall.find(filter).limit(50);

    if (!halls || halls.length === 0) {
      if (debugMode) {
        const sampleAny = await Hall.find({}, 'name featured status _id').limit(5);
        return NextResponse.json(
          {
            halls: [],
            message: 'No featured halls found',
            debug: {
              featuredCount: 0,
              sampleAny,
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { halls: [], message: 'No featured halls found' },
        { status: 404 }
      );
    }

    if (debugMode) {
      const sampleFirst = halls.slice(0, 3).map((h: any) => ({
        _id: h._id,
        name: h.name,
        featured: h.featured,
        status: h.status,
      }));
      return NextResponse.json({
        halls,
        debug: {
          featuredCount: halls.length,
          sampleFirst,
        },
      });
    }

    return NextResponse.json({ halls });
  } catch (err: any) {
    console.error('FEATURED ROUTE ERROR:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error', halls: [] },
      { status: 500 }
    );
  }
}