import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';

export async function GET(
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
    const hall = await Hall.findById(params.id)
      .populate('ownerId', 'name email phone')
      .exec();

    if (!hall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ hall });
  } catch (error) {
    console.error('Error fetching hall:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const data = await request.json();

    // Debug log
    console.log('PUT /api/admin/halls/[id] - Incoming data:', data);

    const updateObj = {
      name: data.name,
      description: data.description,
      capacity: data.capacity,
      price: data.price,
      location: data.location,
      platformFeePercent: data.platformFeePercent, // allow updating platform fee
      updatedAt: new Date(),
    };

    // Debug log
    console.log('PUT /api/admin/halls/[id] - Update object:', updateObj);

    const updatedHall = await Hall.findByIdAndUpdate(
      params.id,
      updateObj,
      { new: true }
    );

    if (!updatedHall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

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
    const deletedHall = await Hall.findByIdAndDelete(params.id);

    if (!deletedHall) {
      return NextResponse.json(
        { error: 'Hall not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Hall deleted successfully' });
  } catch (error) {
    console.error('Error deleting hall:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const body = await request.json();

    // Debug log
    console.log('PATCH /api/admin/halls/[id] - Incoming body:', body);

    if (typeof body.featured === 'boolean') {
      // Update featured status
      const hall = await Hall.findByIdAndUpdate(
        params.id,
        { featured: body.featured },
        { new: true }
      ).populate('ownerId', 'name email phone');
      console.log('Updated hall after PATCH (featured):', hall);
      if (!hall) {
        return NextResponse.json(
          { error: 'Hall not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ 
        hall,
        message: `Hall ${body.featured ? 'marked as' : 'removed from'} featured` 
      });
    } else if (typeof body.platformFeePercent === 'number') {
      // Update platformFeePercent
      const hall = await Hall.findByIdAndUpdate(
        params.id,
        { platformFeePercent: body.platformFeePercent },
        { new: true }
      ).populate('ownerId', 'name email phone');
      console.log('Updated hall after PATCH (platformFeePercent):', hall);
      if (!hall) {
        return NextResponse.json(
          { error: 'Hall not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ 
        hall,
        message: `Hall platform fee updated to ${body.platformFeePercent}%` 
      });
    } else {
      return NextResponse.json(
        { error: 'PATCH body must include either { featured: boolean } or { platformFeePercent: number }' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating hall featured status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
 