import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import mongoose, { Document, Model } from 'mongoose';

export const dynamic = 'force-dynamic';

// Define the Settings schema
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
  createdAt: Date;
  updatedAt: Date;
}

export type SettingsDoc = Document & SettingsAttrs;

const Settings: Model<SettingsDoc> =
  (mongoose.models.Settings as Model<SettingsDoc>) ||
  mongoose.model<SettingsDoc>('Settings', settingsSchema);

// GET /api/admin/settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Get settings or create default if none exist
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        platformFee: 5,
        currency: 'INR',
        bookingTimeSlots: [{ start: '09:00', end: '23:00' }],
        emailTemplates: {
          bookingConfirmation: '',
          paymentSuccess: '',
          bookingCancellation: '',
          hallVerification: ''
        },
        notifications: {
          emailNotifications: true,
          adminEmailNotifications: true,
          ownerEmailNotifications: true
        }
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { settings: newSettings } = await request.json();

    // Validate required fields
    if (!newSettings) {
      return NextResponse.json(
        { error: 'Settings data is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: {
          platformFee: newSettings.platformFee,
          currency: newSettings.currency,
          bookingTimeSlots: newSettings.bookingTimeSlots,
          emailTemplates: newSettings.emailTemplates,
          notifications: newSettings.notifications
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
 