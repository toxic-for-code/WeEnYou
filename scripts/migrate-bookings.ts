import mongoose from 'mongoose';
import Booking from '../models/Booking'; // Adjust path if needed
import { connectDB } from '../lib/db'; // Adjust path if needed
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function migrate() {
  try {
    await connectDB();
    console.log('Connected to database...');

    const bookings = await Booking.find({ payment: { $exists: false } });
    console.log(`Found ${bookings.length} bookings to migrate.`);

    for (const booking of bookings) {
      console.log(`Migrating booking: ${booking._id}`);
      
      const legacyData = booking.toObject();
      
      const payment: any = {
        advancePaid: legacyData.advancePaid ?? false,
        advanceAmount: legacyData.advanceAmount ?? 0,
        remainingBalance: legacyData.remainingBalance ?? legacyData.totalPrice ?? 0,
        paymentStatus: legacyData.paymentStatus || 'pending',
        paymentId: legacyData.paymentId,
        orderId: legacyData.orderId,
        paymentTimestamp: legacyData.paymentTimestamp,
      };

      await Booking.updateOne(
        { _id: booking._id },
        { 
          $set: { payment },
          $unset: {
            advancePaid: "",
            advanceAmount: "",
            remainingBalance: "",
            paymentStatus: "",
            paymentId: "",
            orderId: "",
            paymentTimestamp: ""
          }
        }
      );
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
