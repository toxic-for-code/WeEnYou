import mongoose, { Document, Model } from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'pending_advance',
        'pending_owner_confirmation',
        'confirmed',
        'cancelled',
        'completed',
        'pending_approval'
      ],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentId: {
      type: String,
    },
    advancePaid: {
      type: Boolean,
      default: false,
    },
    finalPaymentMethod: {
      type: String,
      enum: ['online', 'offline', null],
      default: null,
    },
    finalPaymentStatus: {
      type: String,
      enum: ['pending', 'paid', null],
      default: null,
    },
    event_manager_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    pendingChange: {
      type: {
        type: String, // 'reschedule' or 'cancel'
        enum: ['reschedule', 'cancel'],
      },
      startDate: Date,
      endDate: Date,
      requestedAt: Date,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ hallId: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1 });

interface BookingAttrs {
  userId: mongoose.Types.ObjectId;
  hallId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  guests: number;
  specialRequests?: string;
  totalPrice: number;
  status: 'pending' | 'pending_advance' | 'pending_owner_confirmation' | 'confirmed' | 'cancelled' | 'completed' | 'pending_approval';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  advancePaid?: boolean;
  finalPaymentMethod?: 'online' | 'offline' | null;
  finalPaymentStatus?: 'pending' | 'paid' | null;
  event_manager_id?: mongoose.Types.ObjectId;
  pendingChange?: {
    type: 'reschedule' | 'cancel';
    startDate?: Date;
    endDate?: Date;
    requestedAt?: Date;
  };
  reminderSent?: boolean;
}

export type BookingDoc = Document & BookingAttrs & { createdAt: Date; updatedAt: Date };

const Booking: Model<BookingDoc> =
  (mongoose.models.Booking as Model<BookingDoc>) ||
  mongoose.model<BookingDoc>('Booking', bookingSchema);

export default Booking; 
 