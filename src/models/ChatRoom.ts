import mongoose, { Document, Model } from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
  booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

interface ChatRoomAttrs {
  booking_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  owner_id: mongoose.Types.ObjectId;
  provider_id: mongoose.Types.ObjectId;
  createdAt: Date;
}

export type ChatRoomDoc = Document & ChatRoomAttrs;

const ChatRoom: Model<ChatRoomDoc> =
  (mongoose.models.ChatRoom as Model<ChatRoomDoc>) ||
  mongoose.model<ChatRoomDoc>('ChatRoom', chatRoomSchema);

export default ChatRoom; 