import mongoose, { Schema, Document, Types } from 'mongoose';

interface Reference {
  name: string;
  contact: string;
  relation: string;
}

export interface IVerification extends Document {
  user: Types.ObjectId;
  venueName: string;
  venueAddress: string;
  ownerName: string;
  contact: string;
  govtId: string;
  ownershipProof: string;
  businessCert?: string;
  gst?: string;
  pan: string;
  bankProof: string;
  fireCert: string;
  occupancyCert: string;
  permissions: string;
  photos: string[];
  layout: string;
  references: Reference[];
  declaration: boolean;
  signature: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  feedback?: string;
}

const ReferenceSchema = new Schema<Reference>({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  relation: { type: String, required: true },
});

const VerificationSchema = new Schema<IVerification>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  venueName: { type: String, required: true },
  venueAddress: { type: String, required: true },
  ownerName: { type: String, required: true },
  contact: { type: String, required: true },
  govtId: { type: String, required: true },
  ownershipProof: { type: String, required: true },
  businessCert: { type: String },
  gst: { type: String },
  pan: { type: String, required: true },
  bankProof: { type: String, required: true },
  fireCert: { type: String, required: true },
  occupancyCert: { type: String, required: true },
  permissions: { type: String, required: true },
  photos: [{ type: String, required: true }],
  layout: { type: String, required: true },
  references: [ReferenceSchema],
  declaration: { type: Boolean, required: true },
  signature: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  feedback: { type: String },
});

export default mongoose.models.Verification || mongoose.model<IVerification>('Verification', VerificationSchema); 