import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function DELETE() {
  try {
    await connectDB();
    
    // Delete all users with role 'admin'
    const result = await User.deleteMany({ role: 'admin' });
    
    return NextResponse.json({
      message: 'All admin users have been deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting admin users:', error);
    return NextResponse.json(
      { error: 'Failed to delete admin users' },
      { status: 500 }
    );
  }
} 