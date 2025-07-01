import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

messageSchema.index({ from: 1, to: 1 });
messageSchema.index({ serviceId: 1, bookingId: 1 });
messageSchema.index({ createdAt: 1 });

export default mongoose.models.Message || mongoose.model('Message', messageSchema); 