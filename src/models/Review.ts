import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    images: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    response: {
      type: String,
      trim: true,
      default: '',
    },
    flagged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only review a hall once per booking
reviewSchema.index({ hallId: 1, userId: 1, bookingId: 1 }, { unique: true });

// Update hall's average rating when a review is created or updated
reviewSchema.post('save', async function () {
  const Review = mongoose.model('Review');
  const Hall = mongoose.model('Hall');

  const stats = await Review.aggregate([
    { $match: { hallId: this.hallId, status: 'approved' } },
    {
      $group: {
        _id: '$hallId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Hall.findByIdAndUpdate(this.hallId, {
      averageRating: stats[0].averageRating,
      totalReviews: stats[0].totalReviews,
    });
  }
});

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review; 
 