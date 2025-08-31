// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/cookies';
import { verifyToken } from '@/lib/jwt';
import { AuthResponse } from '@/types/user';
import connectDB from '@/lib/mongoDb';
import User from '@/models/user.model';

export async function GET(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const token = getAuthToken(request);
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'No authentication token found',
        },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired token',
        },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(payload.id);
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found or inactive',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          age: user.age,
          isActive: user.isActive,
          lastLogin: user.lastLogin?.toISOString(),
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt?.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}