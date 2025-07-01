import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Hall from '@/models/Hall';

// GET: Get availability for a hall
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const hall = await Hall.findById(params.id);
    if (!hall) return NextResponse.json({ error: 'Hall not found' }, { status: 404 });
    return NextResponse.json({ availability: hall.availability || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Block/set price for a date (owner only)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const hall = await Hall.findById(params.id);
    if (!hall) return NextResponse.json({ error: 'Hall not found' }, { status: 404 });
    if (hall.ownerId.toString() !== session.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { date, isAvailable, specialPrice } = await req.json();
    if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 });
    // Remove existing entry for this date
    hall.availability = hall.availability.filter((a: any) => new Date(a.date).toISOString().slice(0,10) !== new Date(date).toISOString().slice(0,10));
    // Add new entry
    hall.availability.push({ date: new Date(date), isAvailable: isAvailable ?? false, specialPrice });
    await hall.save();
    return NextResponse.json({ availability: hall.availability });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Unblock a date (owner only)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const hall = await Hall.findById(params.id);
    if (!hall) return NextResponse.json({ error: 'Hall not found' }, { status: 404 });
    if (hall.ownerId.toString() !== session.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    const { date } = await req.json();
    if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 });
    hall.availability = hall.availability.filter((a: any) => new Date(a.date).toISOString().slice(0,10) !== new Date(date).toISOString().slice(0,10));
    await hall.save();
    return NextResponse.json({ availability: hall.availability });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
 