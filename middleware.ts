import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const config = {
  matcher: [
    /*
     * Match the root route, all protected routes, and the login page.
     * Exclude Next.js internals and static assets.
     */
    '/',
    '/(protected)/:path*',
    '/login',
  ],
};

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Attempts a silent token refresh by calling the backend directly.
 * On success, returns the new tokens so the caller can set them on both
 * the response (so the browser gets them) AND the request headers
 * (so server components downstream see them via cookies()).
 */
async function tryRefresh(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
} | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.access_token || !data.refresh_token) return null;

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  } catch {
    return null;
  }
}

/**
 * Clears all session cookies and redirects to /login.
 */
function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);

  response.cookies.set('access_token', '', { maxAge: 0, path: '/' });
  response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });
  response.cookies.set('csrf_token', '', { maxAge: 0, path: '/' });

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // -------------------------------------------------------------------------
  // / — redirect to /dashboard if authenticated, otherwise /login
  // -------------------------------------------------------------------------
  if (pathname === '/') {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (refreshToken) {
      const tokens = await tryRefresh(refreshToken);
      if (tokens) {
        const redirect = NextResponse.redirect(new URL('/dashboard', request.url));
        redirect.cookies.set('access_token', tokens.access_token, {
          httpOnly: true, secure: IS_PRODUCTION, sameSite: 'strict', path: '/', maxAge: 3 * 60,
        });
        redirect.cookies.set('refresh_token', tokens.refresh_token, {
          httpOnly: true, secure: IS_PRODUCTION, sameSite: 'strict', path: '/', maxAge: 5 * 60,
        });
        return redirect;
      }
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // -------------------------------------------------------------------------
  // /login — redirect to /dashboard if already authenticated
  // -------------------------------------------------------------------------
  if (pathname === '/login') {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (refreshToken) {
      const tokens = await tryRefresh(refreshToken);
      if (tokens) {
        const redirect = NextResponse.redirect(new URL('/dashboard', request.url));
        redirect.cookies.set('access_token', tokens.access_token, {
          httpOnly: true, secure: IS_PRODUCTION, sameSite: 'strict', path: '/', maxAge: 3 * 60,
        });
        redirect.cookies.set('refresh_token', tokens.refresh_token, {
          httpOnly: true, secure: IS_PRODUCTION, sameSite: 'strict', path: '/', maxAge: 5 * 60,
        });
        return redirect;
      }
    }
    return NextResponse.next();
  }

  // -------------------------------------------------------------------------
  // /(protected)/* — require authentication
  // -------------------------------------------------------------------------

  // Access token present — pass through as-is
  if (accessToken) {
    return NextResponse.next();
  }

  // No access token but refresh token present — attempt silent refresh
  if (refreshToken) {
    const tokens = await tryRefresh(refreshToken);
    if (tokens) {
      // Redirect back to the same URL so the browser makes a fresh request
      // with the new cookies already set. This is more reliable than patching
      // the request headers, which Next.js doesn't always honour in cookies().
      const response = NextResponse.redirect(request.url);
      response.cookies.set('access_token', tokens.access_token, {
        httpOnly: true, secure: IS_PRODUCTION, sameSite: 'strict', path: '/', maxAge: 3 * 60,
      });
      response.cookies.set('refresh_token', tokens.refresh_token, {
        httpOnly: true, secure: IS_PRODUCTION, sameSite: 'strict', path: '/', maxAge: 5 * 60,
      });
      return response;
    }
    return redirectToLogin(request);
  }

  // Neither token present — redirect to login
  return redirectToLogin(request);
}
