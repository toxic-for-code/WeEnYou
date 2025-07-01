import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ServiceReview from '@/models/ServiceReview';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const reviews = await ServiceReview.find({ serviceId: params.id, status: 'approved' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
} 