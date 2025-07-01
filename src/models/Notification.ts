import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['booking', 'cancellation', 'review', 'other'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
});

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema); 
 