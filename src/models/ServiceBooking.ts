import mongoose from 'mongoose';

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

export default mongoose.models.ServiceBooking || mongoose.model('ServiceBooking', serviceBookingSchema); 
 