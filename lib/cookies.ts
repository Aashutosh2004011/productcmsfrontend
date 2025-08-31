import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = process.env.COOKIE_NAME || 'auth-token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: COOKIE_MAX_AGE,
  path: '/',
};

// Server-side cookie operations (for API routes and middleware)
export function setAuthCookie<T>(response: NextResponse<T>, token: string): NextResponse<T> {
  response.cookies.set(COOKIE_NAME, token, cookieOptions);
  return response;
}

export function removeAuthCookie<T>(response: NextResponse<T>): NextResponse<T> {
  response.cookies.set(COOKIE_NAME, '', {
    ...cookieOptions,
    maxAge: 0,
  });
  return response;
}

export function getAuthToken(request: NextRequest): string | null {
  return request.cookies.get(COOKIE_NAME)?.value || null;
}

// Server component cookie operations
export async function getServerAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value || null;
  } catch (error) {
    console.error('Error getting server auth token:', error);
    return null;
  }
}

// Client-side cookie operations
export const clientCookies = {
  set: (token: string) => {
    if (typeof window !== 'undefined') {
      document.cookie = `${COOKIE_NAME}=${token}; max-age=${COOKIE_MAX_AGE}; path=/; ${
        process.env.NODE_ENV === 'production' ? 'secure;' : ''
      } samesite=lax`;
    }
  },

  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === COOKIE_NAME) {
        return value || null;
      }
    }
    return null;
  },

  remove: () => {
    if (typeof window !== 'undefined') {
      document.cookie = `${COOKIE_NAME}=; max-age=0; path=/`;
    }
  },
};