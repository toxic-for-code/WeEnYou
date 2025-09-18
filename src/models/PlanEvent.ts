import mongoose, { Schema, model, models, Document, Model } from 'mongoose';

const PlanEventSchema = new Schema({
  eventType: { type: String, required: true },
  city: { type: String, required: true },
  date: { type: String, required: true },
  guests: { type: String, required: true },
  budget: { type: String, required: true },
  venueType: { type: String, required: true },
  services: [{ type: String }],
  theme: { type: String },
  special: { type: String },
  contactTime: { type: String },
  eventTag: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  userEmail: { type: String },
  userPhone: { type: String },
  event_manager_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'in_planning', 'finalized', 'live', 'completed', 'cancelled'],
    default: 'pending',
  },
  checklist: [
    {
      label: { type: String, required: true },
      completed: { type: Boolean, default: false },
      dueDate: { type: Date },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

interface PlanEventAttrs {
  eventType: string;
  city: string;
  date: string;
  guests: string;
  budget: string;
  venueType: string;
  services: string[];
  theme?: string;
  special?: string;
  contactTime?: string;
  eventTag?: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userPhone?: string;
  event_manager_id?: mongoose.Types.ObjectId;
  status: 'pending' | 'in_planning' | 'finalized' | 'live' | 'completed' | 'cancelled';
  checklist: {
    label: string;
    completed: boolean;
    dueDate?: Date;
    createdAt: Date;
  }[];
  createdAt: Date;
}

export type PlanEventDoc = Document & PlanEventAttrs;

const PlanEvent: Model<PlanEventDoc> =
  (models.PlanEvent as Model<PlanEventDoc>) ||
  model<PlanEventDoc>('PlanEvent', PlanEventSchema);

export default PlanEvent; 