import mongoose, { Document, Model } from 'mongoose';

const messageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall' },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

messageSchema.index({ from: 1, to: 1 });
messageSchema.index({ serviceId: 1, bookingId: 1 });
messageSchema.index({ createdAt: 1 });

interface MessageAttrs {
  from: mongoose.Types.ObjectId;
  to: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  hallId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  conversationId?: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDoc = Document & MessageAttrs;

const Message: Model<MessageDoc> =
  (mongoose.models.Message as Model<MessageDoc>) ||
  mongoose.model<MessageDoc>('Message', messageSchema);

export default Message; 