import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    // Check session
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    if (session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can list halls.' }, { status: 403 });
    }

    // Connect to database
    try {
      await connectDB();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', body);
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
    } = body;

    // Validate required fields
    if (!name || !description || !address || !city || !state || !price || !capacity || !images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields or images must be a non-empty array.',
        details: {
          name: !name,
          description: !description,
          address: !address,
          city: !city,
          state: !state,
          price: !price,
          capacity: !capacity,
          images: !images || !Array.isArray(images) || images.length === 0
        }
      }, { status: 400 });
    }

    // For simplicity, use dummy coordinates. In production, use a geocoding API.
    const coordinates = [77.5946, 12.9716];

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
            coordinates: [77.5946, 12.9716],
          },
        },
        ownerId: session.user.id,
        status: 'active',
        rating: 0,
        reviews: [],
        verified: false,
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        availability: [],
      };

      console.log('Creating hall with data:', hallData);

      const hall = await Hall.create(hallData);
      console.log('Hall created successfully:', hall);
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

export async function GET() {
  try {
    await connectDB();
    console.log('Fetching halls from database...');
    
    const halls = await Hall.find({})
      .lean()
      .sort({ createdAt: -1 });
    
    // Log verification status for each hall
    halls.forEach(hall => {
      console.log(`Hall ${hall.name} (${hall._id}) verification status:`, hall.verified);
    });

    return NextResponse.json({ halls }, { status: 200 });
  } catch (error) {
    console.error('Error fetching halls:', error);
    return NextResponse.json({ error: 'Failed to fetch halls' }, { status: 500 });
  }
} 