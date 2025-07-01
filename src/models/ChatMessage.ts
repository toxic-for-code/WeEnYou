import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  chat_room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender_role: { type: String, enum: ['user', 'owner', 'provider'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema); 