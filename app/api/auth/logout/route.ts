import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * POST /api/auth/logout
 *
 * Reads the httpOnly refresh_token cookie server-side, forwards it to the
 * backend's POST /auth/logout endpoint, then clears all session cookies
 * (access_token, refresh_token, csrf_token) regardless of the backend response.
 *
 * This ensures the portal-side session is always cleared even if the backend
 * call fails.
 */
export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  // Attempt to notify the backend (best-effort)
  if (refreshToken) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Ignore backend errors — we still clear cookies locally
    }
  }

  const response = NextResponse.json(
    { status: 'success', message: 'Logged out' },
    { status: 200 },
  );

  // Clear all session cookies by setting maxAge=0
  const clearCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 0,
  };

  response.cookies.set('access_token', '', clearCookieOptions);
  response.cookies.set('refresh_token', '', clearCookieOptions);

  // csrf_token is not httpOnly, but clear it anyway for completeness
  response.cookies.set('csrf_token', '', {
    ...clearCookieOptions,
    httpOnly: false,
  });

  return response;
}
