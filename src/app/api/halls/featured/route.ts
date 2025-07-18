import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';

export async function GET(req: Request) {
  try {
    await connectDB();

    // Get only featured and active halls
    const halls = await Hall.find({ 
      featured: true, 
      status: 'active' 
    })
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(6);

    return NextResponse.json({ halls });
  } catch (error) {
    console.error('Error fetching featured halls:', error);
    return NextResponse.json({ error: 'Failed to fetch featured halls' }, { status: 500 });
  }
} 