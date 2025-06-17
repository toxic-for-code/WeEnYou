import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';
import Booking from '@/models/Booking';
import Service from '@/models/Service';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const hall = await Hall.findById(params.id)
      .select('+verified')
      .populate('ownerId', 'name email')
      .populate('reviews.userId', 'name');

    if (!hall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    // Fetch bookings and services for this hall
    const [bookings, services] = await Promise.all([
      Booking.find({ hallId: params.id }).sort({ createdAt: -1 }),
      Service.find({ hallId: params.id }).sort({ createdAt: -1 })
    ]);

    // Add bookings and services to the hall object
    const hallWithData = {
      ...hall.toObject(),
      bookings,
      services
    };

    return NextResponse.json({ hall: hallWithData });
  } catch (error) {
    console.error('Error fetching hall:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const hall = await Hall.findById(params.id);
    if (!hall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (hall.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const updates = await req.json();
    const allowedUpdates = [
      'name',
      'description',
      'images',
      'price',
      'capacity',
      'amenities',
      'location',
      'status',
    ];

    // Filter out invalid updates
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    const updatedHall = await Hall.findByIdAndUpdate(
      params.id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ hall: updatedHall });
  } catch (error) {
    console.error('Error updating hall:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const hall = await Hall.findById(params.id);
    if (!hall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (hall.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await Hall.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'Hall deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting hall:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 