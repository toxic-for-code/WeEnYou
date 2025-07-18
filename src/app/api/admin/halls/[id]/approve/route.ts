import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import User from '@/models/User';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const { action, reason, platformFeePercent } = await request.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const hall = await Hall.findById(params.id).populate('ownerId', 'name email');
    if (!hall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    // Update hall status and commission
    const newStatus = action === 'approve' ? 'active' : 'inactive';
    const updateFields: any = {
      status: newStatus,
      verified: action === 'approve' ? true : false,
      updatedAt: new Date(),
    };
    if (typeof platformFeePercent === 'number') {
      updateFields.platformFeePercent = platformFeePercent;
    }
    const updatedHall = await Hall.findByIdAndUpdate(
      params.id,
      updateFields,
      { new: true }
    ).populate('ownerId', 'name email');

    // TODO: Send notification to hall owner about approval/rejection
    // This could be an email notification or in-app notification

    return NextResponse.json({ 
      hall: updatedHall,
      message: `Hall ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      action,
      reason
    });
  } catch (error) {
    console.error('Error approving/rejecting hall:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 