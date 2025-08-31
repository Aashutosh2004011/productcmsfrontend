// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';
import { setAuthCookie } from '@/lib/cookies';
import { RegisterInput, AuthResponse } from '@/types/user';
import connectDB from '@/lib/mongoDb';
import User from '@/models/user.model';

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    await connectDB();
    
    const body: RegisterInput = await request.json();
    const { name, email, password, age } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, email, and password are required',
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 6 characters long',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      age,
    });

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
      message: 'Registration successful',
    });

    // Set HTTP-only cookie
    return setAuthCookie(response, token);
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
        },
        { status: 500 }
      );
    }
  }
}