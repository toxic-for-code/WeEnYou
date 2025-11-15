import mongoose, { Schema, Document, Model } from 'mongoose';

export interface BookingPaymentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  hallId: mongoose.Types.ObjectId;
  totalAmount: number;
  advanceAmountRequested: number;
  advanceAmountPaid?: number;
  advanceOrderId?: string;
  advancePaymentId?: string;
  advancePaymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  remainingAmount?: number;
  remainingOrderId?: string;
  remainingPaymentStatus?: 'open' | 'paid' | 'failed';
  status: 'request_sent' | 'owner_approved' | 'owner_declined' | 'refunded' | 'completed';
  refundId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingPaymentSchema = new Schema<BookingPaymentDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  hallId: { type: Schema.Types.ObjectId, ref: 'Hall', required: true },
  totalAmount: { type: Number, required: true },
  advanceAmountRequested: { type: Number, required: true },
  advanceAmountPaid: { type: Number },
  advanceOrderId: { type: String },
  advancePaymentId: { type: String },
  advancePaymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  remainingAmount: { type: Number },
  remainingOrderId: { type: String },
  remainingPaymentStatus: { type: String, enum: ['open', 'paid', 'failed'] },
  status: { type: String, enum: ['request_sent', 'owner_approved', 'owner_declined', 'refunded', 'completed'], required: true },
  refundId: { type: String },
}, { timestamps: true });

const BookingPayment: Model<BookingPaymentDocument> = mongoose.models.BookingPayment || mongoose.model<BookingPaymentDocument>('BookingPayment', BookingPaymentSchema);

export default BookingPayment;