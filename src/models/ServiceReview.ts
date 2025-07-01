import mongoose from 'mongoose';

const serviceReviewSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
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
      ref: 'ServiceBooking',
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

// Ensure a user can only review a service once per booking
serviceReviewSchema.index({ serviceId: 1, userId: 1, bookingId: 1 }, { unique: true });

const ServiceReview = mongoose.models.ServiceReview || mongoose.model('ServiceReview', serviceReviewSchema);

export default ServiceReview; 