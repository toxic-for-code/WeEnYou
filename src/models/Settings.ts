import mongoose, { Document, Model } from 'mongoose';

const settingsSchema = new mongoose.Schema({
  platformFee: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 5
  },
  currency: {
    type: String,
    required: true,
    enum: ['INR', 'USD', 'EUR'],
    default: 'INR'
  },
  bookingTimeSlots: [{
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  }],
  emailTemplates: {
    bookingConfirmation: {
      type: String,
      default: ''
    },
    paymentSuccess: {
      type: String,
      default: ''
    },
    bookingCancellation: {
      type: String,
      default: ''
    },
    hallVerification: {
      type: String,
      default: ''
    }
  },
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    adminEmailNotifications: {
      type: Boolean,
      default: true
    },
    ownerEmailNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

interface SettingsAttrs {
  platformFee: number;
  currency: 'INR' | 'USD' | 'EUR';
  bookingTimeSlots: {
    start: string;
    end: string;
  }[];
  emailTemplates: {
    bookingConfirmation: string;
    paymentSuccess: string;
    bookingCancellation: string;
    hallVerification: string;
  };
  notifications: {
    emailNotifications: boolean;
    adminEmailNotifications: boolean;
    ownerEmailNotifications: boolean;
  };
}

export type SettingsDoc = Document & SettingsAttrs & { createdAt: Date; updatedAt: Date };

const Settings: Model<SettingsDoc> =
  (mongoose.models.Settings as Model<SettingsDoc>) ||
  mongoose.model<SettingsDoc>('Settings', settingsSchema);

export default Settings;
