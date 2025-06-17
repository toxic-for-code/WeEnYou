import mongoose from 'mongoose';

export interface IHall extends mongoose.Document {
  name: string;
  description: string;
  ownerId: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: number[];
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  capacity: number;
  price: number;
  images: string[];
  amenities: string[];
  rating: number;
  reviews: {
    userId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  availability: {
    date: Date;
    isAvailable: boolean;
  }[];
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Map<number, number>;
}

const hallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
  },
  images: [{
    type: String,
    required: true,
    trim: true,
  }],
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative'],
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide capacity'],
    min: [1, 'Capacity must be at least 1'],
  },
  amenities: [{
    type: String,
    trim: true,
  }],
  verified: {
    type: Boolean,
    default: false,
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide an address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide a state'],
      trim: true,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Please provide coordinates'],
        validate: {
          validator: function(v: number[]) {
            return v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
          },
          message: 'Invalid coordinates',
        },
      },
    },
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  availability: [{
    date: {
      type: Date,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  ratingDistribution: {
    type: Map,
    of: Number,
    default: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
}, {
  timestamps: true,
});

// Create geospatial index for location-based queries
hallSchema.index({ 'location.coordinates': '2dsphere' });

// Create text index for search
hallSchema.index(
  { name: 'text', description: 'text', 'location.city': 'text', 'location.state': 'text' },
  { weights: { name: 10, description: 5, 'location.city': 3, 'location.state': 3 } }
);

// Add indexes for better query performance
hallSchema.index({ 'location.city': 1 });
hallSchema.index({ price: 1 });
hallSchema.index({ capacity: 1 });
hallSchema.index({ rating: -1 });
hallSchema.index({ status: 1 });

export default mongoose.models.Hall || mongoose.model<IHall>('Hall', hallSchema); 