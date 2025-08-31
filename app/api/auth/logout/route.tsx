// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/cookies';
import { AuthResponse } from '@/types/user';

export async function POST(request: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

    return removeAuthCookie(response);
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}