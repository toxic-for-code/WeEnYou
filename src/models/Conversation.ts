import mongoose, { Document, Model } from 'mongoose';

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

interface ConversationAttrs {
  participants: mongoose.Types.ObjectId[];
  conversationType: 'hall_booking' | 'service_booking' | 'coordination' | 'support';
  hallId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ConversationDoc = Document & ConversationAttrs;

const Conversation: Model<ConversationDoc> =
  (mongoose.models.Conversation as Model<ConversationDoc>) ||
  mongoose.model<ConversationDoc>('Conversation', conversationSchema);

export default Conversation; 