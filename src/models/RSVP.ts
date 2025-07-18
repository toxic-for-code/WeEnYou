import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface RSVPDocument extends Document {
  inviteId: string;
  guestEmail: string;
  response: 'Yes' | 'No' | 'Maybe';
  guestCount?: number;
  specialRequests?: string;
  respondedAt: Date;
  eventDate?: Date;
  reminderSent?: boolean;
}

const RSVPSchema = new Schema<RSVPDocument>({
  inviteId: { type: String, required: true, index: true },
  guestEmail: { type: String, required: true },
  response: { type: String, enum: ['Yes', 'No', 'Maybe'], required: true },
  guestCount: { type: Number },
  specialRequests: { type: String },
  respondedAt: { type: Date, default: Date.now },
  eventDate: { type: Date },
  reminderSent: { type: Boolean, default: false },
});

const RSVP = (models.RSVP as mongoose.Model<RSVPDocument>) || model<RSVPDocument>('RSVP', RSVPSchema);
export default RSVP; 