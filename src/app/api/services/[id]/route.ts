import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Service from '@/models/Service';
import { connectDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const service = await Service.findById(params.id);
    if (!service) {
      return NextResponse.json({ service: null }, { status: 404 });
    }
    return NextResponse.json({ service });
  } catch (error) {
    return NextResponse.json({ service: null, error: 'Failed to fetch service' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'provider') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const service = await Service.findById(params.id);
    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }
    if (service.providerId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    const data = await req.json();
    Object.assign(service, data);
    await service.save();
    return NextResponse.json({ service }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to update service.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'provider') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    await connectDB();
    const service = await Service.findById(params.id);
    if (!service) {
      return NextResponse.json({ message: 'Service not found' }, { status: 404 });
    }
    if (service.providerId.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    await service.deleteOne();
    return NextResponse.json({ message: 'Service deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Failed to delete service.' }, { status: 500 });
  }
} 