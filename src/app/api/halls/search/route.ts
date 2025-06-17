import { NextResponse } from 'next/server';
import Hall from '@/models/Hall';
import { connectDB } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get('location');
    const date = searchParams.get('date');
    const capacity = searchParams.get('capacity');
    const priceRange = searchParams.get('priceRange');
    const amenities = searchParams.get('amenities')?.split(',').filter(Boolean) || [];

    console.log('Received search params:', {
      location,
      date,
      capacity,
      priceRange,
      amenities
    });

    await connectDB();

    // Build query
    const query: any = {};

    // Location search
    if (location) {
      query['location.city'] = { $regex: location, $options: 'i' };
    }

    // Date availability
    if (date) {
      query['availability'] = {
        $elemMatch: {
          date: new Date(date),
          isAvailable: true,
        },
      };
    }

    // Capacity filter
    if (capacity && !isNaN(parseInt(capacity))) {
      query.capacity = { $gte: parseInt(capacity) };
    }

    // Price range filter
    if (priceRange) {
      if (priceRange === '50000+') {
        query.price = { $gte: 50000 };
      } else {
        const [min, max] = priceRange.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max)) {
          query.price = { $gte: min, $lte: max };
        } else if (!isNaN(min)) {
          query.price = { $gte: min };
        }
      }
    }

    // Amenities filter
    if (amenities.length > 0) {
      // Convert amenity IDs to proper format (e.g., 'wifi' to 'WiFi')
      const formattedAmenities = amenities.map(amenity => {
        switch (amenity.toLowerCase()) {
          case 'wifi': return 'WiFi';
          case 'ac': return 'Air Conditioning';
          case 'music': return 'Music System';
          default: return amenity.charAt(0).toUpperCase() + amenity.slice(1);
        }
      });
      query.amenities = { $all: formattedAmenities };
    }

    console.log('Final query:', query);

    // Execute query with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [halls, total] = await Promise.all([
      Hall.find(query)
        .sort({ rating: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Hall.countDocuments(query),
    ]);

    console.log(`Found ${halls.length} halls matching the criteria`);

    return NextResponse.json({
      halls,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { message: error.message || 'Something went wrong' },
      { status: 500 }
    );
  }
} 