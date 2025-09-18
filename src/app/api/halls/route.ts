import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Check session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    if (session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can list halls.' }, { status: 403 });
    }

    // Connect to database
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const {
      name,
      description,
      address,
      city,
      state,
      price,
      capacity,
      amenities,
      images,
      coordinates,
    } = body;

    // Validate required fields
    if (!name || !description || !address || !city || !state || !price || !capacity) {
      return NextResponse.json({ 
        error: 'Missing required fields.',
        details: {
          name: !name,
          description: !description,
          address: !address,
          city: !city,
          state: !state,
          price: !price,
          capacity: !capacity
        }
      }, { status: 400 });
    }

    // Validate price and capacity
    if (Number(price) <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
    }

    if (Number(capacity) <= 0) {
      return NextResponse.json({ error: 'Capacity must be greater than 0' }, { status: 400 });
    }

    // Validate coordinates if provided, otherwise use default
    let validCoordinates = [77.5946, 12.9716]; // Default to Bangalore
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      const [lng, lat] = coordinates;
      if (lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90) {
        validCoordinates = coordinates;
      }
    }

    // Create hall
    try {
      const hallData = {
        name,
        description,
        images,
        price: Number(price),
        capacity: Number(capacity),
        amenities: amenities || [],
        location: {
          address,
          city,
          state,
          coordinates: {
            type: 'Point',
            coordinates: validCoordinates,
          },
        },
        ownerId: session.user.id,
        status: 'pending',
        rating: 0,
        reviews: [],
        verified: false,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        availability: [],
      };

      const hall = await (new Hall(hallData)).save();
      return NextResponse.json({ hall }, { status: 201 });
    } catch (createError) {
      console.error('Error creating hall:', createError);
      if (createError instanceof Error) {
        console.error('Error details:', createError.message);
        if ('errors' in createError) {
          console.error('Validation errors:', (createError as any).errors);
        }
        return NextResponse.json({ 
          error: createError.message,
          details: (createError as any).errors || null
        }, { status: 500 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();

    // If owner, return only their halls
    if (session?.user?.role === 'owner') {
      const halls = await Hall.find({ ownerId: session.user.id }).sort({ createdAt: -1 });
      return NextResponse.json({ halls }, { status: 200 });
    }

    // Otherwise, return only approved halls (status: 'active') for public listing
    const halls = await Hall.find({ status: 'active' }).sort({ createdAt: -1 });
    return NextResponse.json({ halls }, { status: 200 });
  } catch (error) {
    console.error('Error fetching halls:', error);
    return NextResponse.json({ error: 'Failed to fetch halls' }, { status: 500 });
  }
} 
 