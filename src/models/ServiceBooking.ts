import mongoose, { Document, Model } from 'mongoose';

const serviceBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hallBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  paymentId: { type: String },
  specialRequests: { type: String, trim: true },
}, { timestamps: true });

serviceBookingSchema.index({ providerId: 1, createdAt: -1 });
serviceBookingSchema.index({ userId: 1, createdAt: -1 });
serviceBookingSchema.index({ serviceId: 1 });

interface ServiceBookingAttrs {
  userId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  hallBookingId?: mongoose.Types.ObjectId;
  hallId?: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentId?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ServiceBookingDoc = Document & ServiceBookingAttrs;

const ServiceBooking: Model<ServiceBookingDoc> =
  (mongoose.models.ServiceBooking as Model<ServiceBookingDoc>) ||
  mongoose.model<ServiceBookingDoc>('ServiceBooking', serviceBookingSchema);

export default ServiceBooking; 
 