import mongoose, { Schema, Document, models, model, Model } from 'mongoose';

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

export type SupportRequestDoc = Document & ISupportRequest;

const SupportRequest: Model<SupportRequestDoc> =
  (models.SupportRequest as Model<SupportRequestDoc>) ||
  model<SupportRequestDoc>('SupportRequest', SupportRequestSchema);

export default SupportRequest; 