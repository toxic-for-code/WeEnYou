import mongoose, { Document, Model } from 'mongoose';

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
    specialPrice?: number;
  }[];
  verified: boolean;
  featured: boolean;
  status: 'pending' | 'active' | 'inactive' | 'rejected';
  venueType: string[];
  eventSpaces: {
    name: string;
    type: 'Hall' | 'Lawn' | 'Rooftop' | 'Poolside' | 'Other';
    area?: number;
    seatingCapacity: number;
    floatingCapacity: number;
    images?: string[];
  }[];
  pricingBreakdown?: {
    hallRental?: number;
    lawnRental?: number;
    fullVenueBuyout?: number;
    gstPercent: number;
    serviceChargePercent?: number;
  };
  catering: {
    inHouseAvailable: boolean;
    outsideAllowed: boolean;
    vegPricePerPlate?: number;
    nonVegPricePerPlate?: number;
    cuisines: string[];
  };
  vendorRules: {
    inHouseDecorator: boolean;
    outsideDecoratorAllowed: boolean;
    decorationStartingCost?: number;
    djAllowed: boolean;
    outsideDjAllowed: boolean;
    photographyAllowed: boolean;
    photographyStartingCost?: number;
    videographyStartingCost?: number;
    liveBandAllowed: boolean;
    soundSystemAvailable: boolean;
    lightingStartingCost?: number;
    stageStartingCost?: number;
  };
  beautyAndGrooming?: {
    bridalMakeupAvailable: boolean;
    makeupStartingPrice?: number;
    mehendiArtistAvailable: boolean;
    mehendiStartingPrice?: number;
    hairstylistAvailable: boolean;
  };
  eventPlanning?: {
    plannerAvailable: boolean;
    plannerStartingPrice?: number;
    coordinatorAvailable: boolean;
  };
  logistics?: {
    transportationAvailable: boolean;
    transportationStartingPrice?: number;
    hospitalityTeamAvailable: boolean;
  };
  religiousServices?: {
    panditAvailable: boolean;
    priestAvailable: boolean;
    ritualSetupAvailable: boolean;
  };
  accommodation?: {
    roomsAvailable: number;
    startingPrice?: number;
    bridalSuiteCount: number;
    complimentaryRooms: number;
  };
  policies: {
    alcoholAllowed: boolean;
    outsideAlcoholAllowed: boolean;
    musicTimeLimit?: string;
    lateNightEvents: boolean;
    cancellationPolicy: string;
  };
  parking: {
    capacity: number;
    valetAvailable: boolean;
    charges?: string;
  };
  nearbyTransport?: {
    airport?: string;
    railway?: string;
    metro?: string;
  };
  faqs: {
    question: string;
    answer: string;
  }[];
  highlights: string[];
  createdAt: Date;
  updatedAt: Date;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Map<number, number>;
  platformFeePercent?: number;
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
  images: {
    type: [String],
    default: [],
  },
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
  amenities: {
    type: [String],
    default: [],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  platformFeePercent: {
    type: Number,
    default: 10,
    min: 0,
    max: 100,
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
    enum: ['pending', 'active', 'inactive', 'rejected'],
    default: 'pending',
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
    specialPrice: {
      type: Number,
      default: null,
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
    venueType: [String],
    eventSpaces: [{
      name: String,
      type: { type: String, enum: ['Hall', 'Lawn', 'Rooftop', 'Poolside', 'Other'] },
      area: Number,
      seatingCapacity: Number,
      floatingCapacity: Number,
      images: [String]
    }],
    pricingBreakdown: {
      hallRental: Number,
      lawnRental: Number,
      fullVenueBuyout: Number,
      gstPercent: { type: Number, default: 18 },
      serviceChargePercent: Number
    },
    catering: {
      inHouseAvailable: { type: Boolean, default: false },
      outsideAllowed: { type: Boolean, default: true },
      vegPricePerPlate: Number,
      nonVegPricePerPlate: Number,
      cuisines: [String]
    },
    vendorRules: {
      inHouseDecorator: { type: Boolean, default: false },
      outsideDecoratorAllowed: { type: Boolean, default: true },
      decorationStartingCost: Number,
      djAllowed: { type: Boolean, default: true },
      outsideDjAllowed: { type: Boolean, default: true },
      photographyAllowed: { type: Boolean, default: true },
      photographyStartingCost: Number,
      videographyStartingCost: Number,
      liveBandAllowed: { type: Boolean, default: false },
      soundSystemAvailable: { type: Boolean, default: true },
      lightingStartingCost: Number,
      stageStartingCost: Number
    },
    beautyAndGrooming: {
      bridalMakeupAvailable: { type: Boolean, default: false },
      makeupStartingPrice: Number,
      mehendiArtistAvailable: { type: Boolean, default: false },
      mehendiStartingPrice: Number,
      hairstylistAvailable: { type: Boolean, default: false }
    },
    eventPlanning: {
      plannerAvailable: { type: Boolean, default: false },
      plannerStartingPrice: Number,
      coordinatorAvailable: { type: Boolean, default: false }
    },
    logistics: {
      transportationAvailable: { type: Boolean, default: false },
      transportationStartingPrice: Number,
      hospitalityTeamAvailable: { type: Boolean, default: false }
    },
    religiousServices: {
      panditAvailable: { type: Boolean, default: false },
      priestAvailable: { type: Boolean, default: false },
      ritualSetupAvailable: { type: Boolean, default: false }
    },
    accommodation: {
      roomsAvailable: { type: Number, default: 0 },
      startingPrice: Number,
      bridalSuiteCount: { type: Number, default: 0 },
      complimentaryRooms: { type: Number, default: 0 }
    },
    policies: {
      alcoholAllowed: { type: Boolean, default: false },
      outsideAlcoholAllowed: { type: Boolean, default: false },
      musicTimeLimit: String,
      lateNightEvents: { type: Boolean, default: false },
      perHourExtendedCharges: Number,
      cancellationPolicy: String
    },
    parking: {
      capacity: { type: Number, default: 0 },
      valetAvailable: { type: Boolean, default: false },
      charges: String
    },
    nearbyTransport: {
      airport: String,
      railway: String,
      metro: String
    },
    faqs: [{
      question: String,
      answer: String
    }],
    highlights: [String]
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
hallSchema.index({ featured: 1 });

export type HallDoc = Document & IHall;

const Hall: Model<HallDoc> =
  (mongoose.models.Hall as Model<HallDoc>) ||
  mongoose.model<HallDoc>('Hall', hallSchema);

export default Hall; 
 