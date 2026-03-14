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
    customerPhone: {
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
        'pending_advance',
        'waiting_owner_confirmation',
        'owner_confirmed',
        'confirmed',
        'rejected',
        'cancelled',
        'completed'
      ],
      default: 'pending_advance',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partial_paid', 'refund_pending', 'refunded'],
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
    // Payment-related fields for Razorpay
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    ownerName: {
      type: String,
    },
    ownerEmail: {
      type: String,
    },
    ownerPhone: {
      type: String,
    },
    ownerContactId: {
      type: String,
    },
    ownerFundAccountId: {
      type: String,
    },
    ownerBankDetails: {
      upi: { type: String },
      name: { type: String },
      ifsc: { type: String },
      accountNumber: { type: String },
    },
    venuePrice: {
      type: Number,
    },
    orderId: {
      type: String, // Razorpay order ID — saved at order creation for webhook lookup
    },
    finalOrderId: {
      type: String, // Specifically for the remaining balance payment
    },
    paymentTimestamp: {
      type: Date, // When payment was captured
    },
    advanceAmount: {
      type: Number,
      default: 0,
    },
    remainingBalance: {
      type: Number,
      default: 0,
    },
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
  startDate: Date;
  endDate: Date;
  guests: number;
  specialRequests?: string;
  customerPhone?: string;
  totalPrice: number;
  status: 'pending_advance' | 'waiting_owner_confirmation' | 'owner_confirmed' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'partial_paid' | 'refund_pending' | 'refunded';
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
  // Payment-related fields for Razorpay
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
  venuePrice?: number;
  orderId?: string;
  finalOrderId?: string;
  paymentTimestamp?: Date;
  advanceAmount?: number;
  remainingBalance?: number;
  bookingPaymentId?: mongoose.Types.ObjectId;
}

export type BookingDoc = Document & BookingAttrs & { createdAt: Date; updatedAt: Date };

const Booking: Model<BookingDoc> =
  (mongoose.models.Booking as Model<BookingDoc>) ||
  mongoose.model<BookingDoc>('Booking', bookingSchema);

export default Booking; 
 