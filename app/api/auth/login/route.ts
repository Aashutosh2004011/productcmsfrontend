// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';
import { setAuthCookie } from '@/lib/cookies';
import { LoginInput, AuthResponse } from '@/types/user';
import connectDB from '@/lib/mongoDb';
import User from '@/models/user.model';

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    await connectDB();
    
    const body: LoginInput = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Find user with password using standard Mongoose methods
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    // Create response
    const response = NextResponse.json({
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
      message: 'Login successful',
    });

    // Set HTTP-only cookie
    return setAuthCookie(response, token);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}