import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Hall from '@/models/Hall';

// GET: Get user's wishlist
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const user = await User.findById(session.user.id).populate('wishlist');
    return NextResponse.json({ wishlist: user.wishlist });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add hall to wishlist
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const { hallId } = await req.json();
    if (!hallId) return NextResponse.json({ error: 'hallId required' }, { status: 400 });
    const user = await User.findById(session.user.id);
    if (!user.wishlist.includes(hallId)) {
      user.wishlist.push(hallId);
      await user.save();
    }
    return NextResponse.json({ wishlist: user.wishlist });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove hall from wishlist
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    await connectDB();
    const { hallId } = await req.json();
    if (!hallId) return NextResponse.json({ error: 'hallId required' }, { status: 400 });
    const user = await User.findById(session.user.id);
    user.wishlist = user.wishlist.filter((id: any) => id.toString() !== hallId);
    await user.save();
    return NextResponse.json({ wishlist: user.wishlist });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
 