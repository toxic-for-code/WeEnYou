import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import Review from '@/models/Review';
import ReviewSection from './ReviewSection';
import { authOptions } from '@/lib/auth';

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    page?: string;
    limit?: string;
    sort?: string;
  };
}

export default async function HallReviewsPage({
  params,
  searchParams,
}: PageProps) {
  const session = await getServerSession(authOptions);
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  const sort = searchParams.sort || 'recent';

  await connectDB();

  const hall = await Hall.findById(params.id);
  if (!hall) {
    notFound();
  }

  // Get user's completed bookings for this hall
  const userBookings = session?.user
    ? await Review.find({
        hallId: params.id,
        userId: session.user.id,
      }).select('bookingId')
    : [];

  const reviewedBookingIds = new Set(userBookings.map((r) => r.bookingId));

  // Get reviews with pagination
  const skip = (page - 1) * limit;
  const reviews = await Review.find({ hallId: params.id, status: 'approved' })
    .populate('userId', 'name image')
    .sort(
      sort === 'recent'
        ? { createdAt: -1 }
        : sort === 'highest'
        ? { rating: -1 }
        : { rating: 1 }
    )
    .skip(skip)
    .limit(limit);

  const totalReviews = await Review.countDocuments({
    hallId: params.id,
    status: 'approved',
  });

  // Calculate rating distribution
  const ratingDistribution = await Review.aggregate([
    { $match: { hallId: params.id, status: 'approved' } },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
  ]);

  const distribution = ratingDistribution.reduce(
    (acc, { _id, count }) => ({
      ...acc,
      [_id]: count,
    }),
    {}
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reviews for {hall.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Read what others have to say about this venue
          </p>
        </div>

        <ReviewSection
          hallId={params.id}
          initialReviews={reviews.map((review) => ({
            _id: review._id.toString(),
            rating: review.rating,
            comment: review.comment,
            images: review.images,
            createdAt: review.createdAt.toISOString(),
            user: {
              name: (review.userId as any)?.name || 'User',
              image: (review.userId as any)?.image || null,
            },
          }))}
          totalReviews={totalReviews}
          averageRating={hall.averageRating}
          ratingDistribution={distribution}
          hasMore={skip + reviews.length < totalReviews}
          canReview={!!session?.user && !reviewedBookingIds.size}
        />
      </div>
    </div>
  );
} 
 