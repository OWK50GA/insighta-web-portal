import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Shared proxy handler for all /api/profiles/* requests.
 *
 * Forwards the request to the backend with session cookies injected
 * server-side. Required because the portal (Vercel) and backend (Railway)
 * are on different domains — browsers block cross-origin cookies.
 *
 * @param req - The incoming Next.js request
 * @param subPath - The path after /api/profiles (e.g. '' | '/search' | '/123')
 */
export async function handler(
  req: NextRequest,
  subPath: string,
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  console.log(
    "[proxy] forwarding cookies:",
    cookieHeader.replace(/access_token=[^;]+/, "access_token=<redacted>"),
  );

  const backendPath = `/api/profiles${subPath}`;
  const backendUrl = new URL(backendPath, API_BASE);

  // Forward all query params
  req.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  const headers = new Headers();
  headers.set("Cookie", cookieHeader);
  headers.set("X-API-Version", "1");

  const method = req.method.toUpperCase();

  // Forward CSRF token on mutating requests
  const csrfToken = cookieStore.get("csrf_token")?.value;
  if (MUTATING.has(method) && csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  // Forward Content-Type for requests with a body
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

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
      { status: "error", message: "Failed to reach backend" },
      { status: 502 },
    );
  }

  // Stream the response back — handles both JSON and CSV
  const responseHeaders = new Headers();
  const contentTypeRes = backendRes.headers.get("content-type");
  if (contentTypeRes) responseHeaders.set("Content-Type", contentTypeRes);
  const contentDisposition = backendRes.headers.get("content-disposition");
  if (contentDisposition)
    responseHeaders.set("Content-Disposition", contentDisposition);

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: responseHeaders,
  });
}
