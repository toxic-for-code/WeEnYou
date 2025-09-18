import mongoose, { Document, Model } from 'mongoose';

const serviceSchema = new mongoose.Schema({
  serviceType: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  contact: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [{ type: String }],
  verified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  availability: [{
    date: { type: Date, required: true },
    isAvailable: { type: Boolean, default: true },
  }],
}, { timestamps: true });

interface ServiceAttrs {
  serviceType: string;
  name: string;
  description: string;
  price: number;
  contact: string;
  city: string;
  state: string;
  providerId: mongoose.Types.ObjectId;
  images: string[];
  verified: boolean;
  status: 'active' | 'inactive';
  availability: {
    date: Date;
    isAvailable: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export type ServiceDoc = Document & ServiceAttrs;

const Service: Model<ServiceDoc> =
  (mongoose.models.Service as Model<ServiceDoc>) ||
  mongoose.model<ServiceDoc>('Service', serviceSchema);

export default Service; 
 