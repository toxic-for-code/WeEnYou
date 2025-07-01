import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Review from '@/models/Review';
import Booking from '@/models/Booking';
import Hall from '@/models/Hall';
import Notification from '@/models/Notification';

// Get reviews for a hall
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || '-createdAt';

    await connectDB();

    const reviews = await Review.find({ hallId: params.id, status: 'approved' })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('userId', 'name');

    const total = await Review.countDocuments({
      hallId: params.id,
      status: 'approved',
    });

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new review
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rating, comment, images, bookingId } = body;

    await connectDB();

    // Verify that the user has a completed booking for this hall
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: session.user.id,
      hallId: params.id,
      status: 'completed',
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'You can only review halls you have booked and completed' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this booking
    const existingReview = await Review.findOne({
      bookingId,
      userId: session.user.id,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this booking' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await Review.create({
      hallId: params.id,
      userId: session.user.id,
      rating,
      comment,
      images,
      bookingId,
    });

    // Notify owner
    const hall = await Hall.findById(params.id);
    if (hall) {
      await Notification.create({
        userId: hall.ownerId,
        type: 'review',
        message: `New review for ${hall.name}: ${rating} stars - "${comment?.slice(0, 40)}${comment?.length > 40 ? '...' : ''}"`,
      });
    }

    // Update hall's rating distribution
    if (hall) {
      const distribution = hall.ratingDistribution || new Map();
      distribution.set(rating, (distribution.get(rating) || 0) + 1);
      hall.ratingDistribution = distribution;
      await hall.save();
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/halls/[id]/reviews/[reviewId]/response
export async function POST_response(request: Request, { params }: { params: { id: string, reviewId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const review = await Review.findById(params.reviewId);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    const hall = await Hall.findById(params.id);
    if (!hall || hall.ownerId.toString() !== session.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { response } = await request.json();
    review.response = response;
    await review.save();
    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/halls/[id]/reviews/[reviewId]/flag
export async function POST_flag(request: Request, { params }: { params: { id: string, reviewId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const review = await Review.findById(params.reviewId);
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    const hall = await Hall.findById(params.id);
    if (!hall || hall.ownerId.toString() !== session.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    review.flagged = true;
    await review.save();
    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
 