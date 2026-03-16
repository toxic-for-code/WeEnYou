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
    eventType: {
      type: String,
      enum: ['wedding', 'birthday', 'engagement', 'corporate'],
      required: true,
    },
    eventStartTime: {
      type: String,
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
    customerPhone: {
      type: String,
      trim: true,
    },
    venuePrice: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    platformFeePercentage: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    payment: {
      advancePaid: {
        type: Boolean,
        default: false,
      },
      advanceAmount: {
        type: Number,
        default: 0,
      },
      remainingBalance: {
        type: Number,
        default: 0,
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'partial_paid', 'refund_pending', 'refunded'],
        default: 'pending',
      },
      orderId: {
        type: String,
      },
      paymentId: {
        type: String,
      },
      paymentTimestamp: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: [
        'pending_advance',
        'waiting_owner_confirmation',
        'owner_confirmed',
        'confirmed',
        'rejected',
        'cancellation_requested',
        'cancelled',
        'completed'
      ],
      default: 'pending_advance',
    },
    cancellationRequested: {
      type: Boolean,
      default: false,
    },
    cancellationRequestedBy: {
      type: String,
      enum: ['user', 'owner', 'admin', null],
      default: null,
    },
    cancellationReason: String,
    cancellationRequestedAt: Date,
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ['user', 'owner', 'admin', null],
      default: null,
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
    // Owner details for payouts
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    ownerName: String,
    ownerEmail: String,
    ownerPhone: String,
    ownerContactId: String,
    ownerFundAccountId: String,
    ownerBankDetails: {
      upi: String,
      name: String,
      ifsc: String,
      accountNumber: String,
    },
    finalOrderId: String,
    bookingPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BookingPayment',
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
  eventType: 'wedding' | 'birthday' | 'engagement' | 'corporate';
  eventStartTime: string;
  startDate: Date;
  endDate: Date;
  guests: number;
  specialRequests?: string;
  customerPhone?: string;
  venuePrice: number;
  platformFee: number;
  platformFeePercentage: number;
  totalPrice: number;
  payment: {
    advancePaid: boolean;
    advanceAmount: number;
    remainingBalance: number;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'partial_paid' | 'refund_pending' | 'refunded';
    orderId?: string;
    paymentId?: string;
    paymentTimestamp?: Date;
  };
  status: 'pending_advance' | 'waiting_owner_confirmation' | 'owner_confirmed' | 'confirmed' | 'rejected' | 'cancellation_requested' | 'cancelled' | 'completed';
  cancellationRequested?: boolean;
  cancellationRequestedBy?: 'user' | 'owner' | 'admin' | null;
  cancellationReason?: string;
  cancellationRequestedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: 'user' | 'owner' | 'admin' | null;
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
  ownerId?: mongoose.Types.ObjectId;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerContactId?: string;
  ownerFundAccountId?: string;
  ownerBankDetails?: {
    upi?: string;
    name?: string;
    ifsc?: string;
    accountNumber?: string;
  };
  finalOrderId?: string;
  bookingPaymentId?: mongoose.Types.ObjectId;
}

export type BookingDoc = Document & BookingAttrs & { createdAt: Date; updatedAt: Date };

// Force-reload the model to pick up schema changes in active dev environment
if (mongoose.models && mongoose.models.Booking) {
  delete mongoose.models.Booking;
}

const Booking: Model<BookingDoc> = mongoose.model<BookingDoc>('Booking', bookingSchema);

export default Booking;
 