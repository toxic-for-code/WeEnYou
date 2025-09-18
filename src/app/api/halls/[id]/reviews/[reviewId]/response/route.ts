import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import Hall from '@/models/Hall';

// POST /api/halls/[id]/reviews/[reviewId]/response
export async function POST(request: Request, { params }: { params: { id: string, reviewId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const review = await Review.findById(params.reviewId);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    const hall = await Hall.findById(params.id);
    if (!hall || hall.ownerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { response } = await request.json();
    review.response = response;
    await review.save();

    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


