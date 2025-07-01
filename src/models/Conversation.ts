import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  conversationType: {
    type: String,
    enum: ['hall_booking', 'service_booking', 'coordination', 'support'],
    required: true,
  },
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall' },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastMessageAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

conversationSchema.index({ participants: 1, conversationType: 1, hallId: 1, serviceId: 1, bookingId: 1 });

export default mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema); 