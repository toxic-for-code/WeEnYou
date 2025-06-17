import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Verification request received for hall ID:', params.id);
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      console.log('Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const hall = await Hall.findById(params.id).select('+verified');
    console.log('Found hall:', hall ? 'Yes' : 'No');

    if (!hall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    console.log('Current verification status:', hall.verified);
    
    // Toggle the verified status
    hall.verified = !hall.verified;
    await hall.save();
    console.log('New verification status:', hall.verified);

    // Convert to plain object and send response
    const plainHall = hall.toObject();
    console.log('Sending response with hall:', plainHall);

    return NextResponse.json({ 
      hall: {
        ...plainHall,
        verified: hall.verified // Explicitly include verified status
      },
      message: `Hall ${hall.verified ? 'verified' : 'unverified'} successfully` 
    });
  } catch (error) {
    console.error('Error toggling hall verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 