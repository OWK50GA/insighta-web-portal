import { redirect } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * The authenticated user's profile as returned by GET /auth/me.
 * Matches the shape of the former `mockUser` so all existing prop usages
 * are compatible without changes.
 */
export interface SessionUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'analyst';
  avatar_url: string;
  created_at: string;
}

/**
 * Fetches the current user from the backend by forwarding the request's
 * Cookie header to GET /auth/me.
 *
 * Returns the `SessionUser` on success, or `null` if:
 * - The access token cookie is absent or expired (401)
 * - The backend returns any other non-2xx response
 * - A network error occurs
 *
 * This function is intended for server-side use only (middleware, server
 * components, route handlers). It must not be called from client components.
 */
export async function getSession(cookieHeader: string): Promise<SessionUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    // Backend wraps the user in { status: 'success', user: { ... } }
    return (data.user ?? data) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Like `getSession`, but throws a redirect to `/login` if the session is
 * absent or invalid. Use this in server components and route handlers that
 * require an authenticated user.
 *
 * Note: `redirect()` from next/navigation throws internally, so callers do
 * not need to handle the return value when the session is null.
 */
export async function requireSession(cookieHeader: string): Promise<SessionUser> {
  const user = await getSession(cookieHeader);
  if (!user) {
    redirect('/login');
  }
  return user;
}
