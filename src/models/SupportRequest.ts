import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ISupportRequest extends Document {
  user: Schema.Types.ObjectId;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const SupportRequestSchema = new Schema<ISupportRequest>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default (models.SupportRequest as mongoose.Model<ISupportRequest>) || model<ISupportRequest>('SupportRequest', SupportRequestSchema); 