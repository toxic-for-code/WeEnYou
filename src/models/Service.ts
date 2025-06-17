import mongoose from 'mongoose';

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
}, { timestamps: true });

export default mongoose.models.Service || mongoose.model('Service', serviceSchema); 