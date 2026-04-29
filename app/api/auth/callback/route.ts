import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/callback
 *
 * Receives tokens from the backend OAuth callback as query parameters,
 * sets them as cookies on the portal's own domain, then redirects to /dashboard.
 *
 * This indirection is necessary when the backend and portal are on different
 * domains (e.g. Railway + Vercel). Cookies set by the backend are scoped to
 * the backend's domain and are never sent to the portal by the browser.
 * By redirecting here first, the portal sets the cookies on its own domain.
 *
 * The tokens are only ever in a server-to-server redirect URL — they are
 * never visible in the browser's address bar.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const csrfToken = searchParams.get('csrf_token');
  const error = searchParams.get('error');

  // Surface any OAuth errors back to the login page
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, req.url),
    );
  }

  if (!accessToken || !refreshToken || !csrfToken) {
    return NextResponse.redirect(
      new URL('/login?error=missing_tokens', req.url),
    );
  }

  const isProduction = process.env.NODE_ENV === 'production';

  const response = NextResponse.redirect(new URL('/dashboard', req.url));

  // Set all three cookies on the portal's domain
  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 3 * 60, // 3 minutes per PRD
  });

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 5 * 60, // 5 minutes per PRD
  });

  // csrf_token is readable by JS (non-httpOnly) for the CSRF double-submit pattern
  response.cookies.set('csrf_token', csrfToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
