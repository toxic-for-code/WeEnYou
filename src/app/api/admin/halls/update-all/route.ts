import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    
    // Update all halls to have a default verification status
    const result = await Hall.updateMany(
      { verified: { $exists: false } }, // Only update halls that don't have the field
      { $set: { verified: false } }
    );

    console.log('Update result:', result);

    return NextResponse.json({ 
      message: 'All halls updated successfully',
      result
    });
  } catch (error) {
    console.error('Error updating halls:', error);
    return NextResponse.json(
      { error: 'Failed to update halls' },
      { status: 500 }
    );
  }
} 