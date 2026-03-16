import mongoose, { Document, Model } from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['booking', 'cancellation', 'cancellation_request', 'cancellation_approved', 'review', 'other'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
});

interface NotificationAttrs {
  userId: mongoose.Types.ObjectId;
  type: 'booking' | 'cancellation' | 'cancellation_request' | 'cancellation_approved' | 'review' | 'other';
  message: string;
  read: boolean;
  createdAt: Date;
  conversationId?: mongoose.Types.ObjectId;
  messageId?: mongoose.Types.ObjectId;
}

export type NotificationDoc = Document & NotificationAttrs;

// Force-reload the model to pick up schema changes in active dev environment
if (mongoose.models && mongoose.models.Notification) {
  delete (mongoose.models as any).Notification;
}

const Notification: Model<NotificationDoc> = mongoose.model<NotificationDoc>('Notification', notificationSchema);

export default Notification; 
 