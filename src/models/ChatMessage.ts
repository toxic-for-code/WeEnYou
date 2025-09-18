import mongoose, { Document, Model } from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  chat_room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender_role: { type: String, enum: ['user', 'owner', 'provider'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

interface ChatMessageAttrs {
  chat_room_id: mongoose.Types.ObjectId;
  sender_id: mongoose.Types.ObjectId;
  sender_role: 'user' | 'owner' | 'provider';
  content: string;
  timestamp: Date;
  read_by: mongoose.Types.ObjectId[];
}

export type ChatMessageDoc = Document & ChatMessageAttrs;

const ChatMessage: Model<ChatMessageDoc> =
  (mongoose.models.ChatMessage as Model<ChatMessageDoc>) ||
  mongoose.model<ChatMessageDoc>('ChatMessage', chatMessageSchema);

export default ChatMessage; 