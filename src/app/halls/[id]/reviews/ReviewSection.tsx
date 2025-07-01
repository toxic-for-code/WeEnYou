'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
}

interface ReviewSectionProps {
  hallId: string;
  initialReviews: Review[];
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<string, number>;
  hasMore: boolean;
  canReview: boolean;
}

export default function ReviewSection({
  hallId,
  initialReviews,
  totalReviews,
  averageRating,
  ratingDistribution,
  hasMore: initialHasMore,
  canReview,
}: ReviewSectionProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const loadMoreReviews = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(
        `/api/halls/${hallId}/reviews?page=${nextPage}&limit=10`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load more reviews');
      }

      setReviews((prev) => [...prev, ...data.reviews]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    setShowReviewForm(false);
    router.refresh();
  };

  const handleReviewCancel = () => {
    setShowReviewForm(false);
  };

  return (
    <div className="space-y-8">
      <ReviewList
        reviews={reviews}
        totalReviews={totalReviews}
        averageRating={averageRating}
        ratingDistribution={ratingDistribution}
        onLoadMore={loadMoreReviews}
        hasMore={hasMore}
      />

      {canReview && !showReviewForm && (
        <div className="mt-8">
          <button
            onClick={() => setShowReviewForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Write a Review
          </button>
        </div>
      )}

      {showReviewForm && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Write a Review</h2>
          <div className="mt-4">
            <ReviewForm
              hallId={hallId}
              bookingId=""
              onSubmit={handleReviewSubmit}
              onCancel={handleReviewCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
} 
 