import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Proxy all /api/profiles/* requests to the backend.
 *
 * This is required in production because the portal (Vercel) and backend
 * (Railway) are on different domains. Browsers block cross-origin cookies
 * even with credentials: 'include', so all API calls must go through this
 * same-origin proxy which forwards the session cookies server-side.
 */
async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // Reconstruct the backend URL preserving query string
  const backendPath = `/api/profiles/${path.join('/')}`;
  const backendUrl = new URL(backendPath, API_BASE);

  // Forward all query params
  req.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  const headers = new Headers();
  headers.set('Cookie', cookieHeader);
  headers.set('X-API-Version', '1');

  // Forward CSRF token on mutating requests
  const csrfToken = cookieStore.get('csrf_token')?.value;
  const method = req.method.toUpperCase();
  const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  if (MUTATING.has(method) && csrfToken) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  // Forward Content-Type for requests with a body
  const contentType = req.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  let body: ArrayBuffer | undefined;
  if (MUTATING.has(method)) {
    const buf = await req.arrayBuffer();
    body = buf.byteLength > 0 ? buf : undefined;
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(backendUrl.toString(), {
      method,
      headers,
      body,
    });
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Failed to reach backend' },
      { status: 502 },
    );
  }

  // Stream the response back — handles both JSON and CSV
  const responseHeaders = new Headers();
  const contentTypeRes = backendRes.headers.get('content-type');
  if (contentTypeRes) responseHeaders.set('Content-Type', contentTypeRes);
  const contentDisposition = backendRes.headers.get('content-disposition');
  if (contentDisposition) responseHeaders.set('Content-Disposition', contentDisposition);

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const DELETE = handler;
export const PUT = handler;
export const PATCH = handler;
