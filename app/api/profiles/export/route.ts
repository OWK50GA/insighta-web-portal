import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * GET /api/profiles/export
 *
 * Proxies the CSV export request to the backend, injecting the required
 * X-API-Version: 1 header and forwarding the access_token cookie.
 * Streams the CSV response back to the browser so the file downloads.
 *
 * All query params (format, filters, sort) are forwarded as-is.
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // Forward all query params to the backend
  const { searchParams } = req.nextUrl;
  const qs = searchParams.toString();

  let backendRes: Response;
  try {
    backendRes = await fetch(
      `${API_BASE}/api/profiles/export${qs ? `?${qs}` : ""}`,
      {
        method: "GET",
        headers: {
          "X-API-Version": "1",
          Cookie: cookieHeader,
        },
      },
    );
  } catch {
    return NextResponse.json(
      { status: "error", message: "Failed to reach backend" },
      { status: 502 },
    );
  }

  if (!backendRes.ok) {
    const body = await backendRes.text();
    return new NextResponse(body, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Stream the CSV back with the original Content-Disposition header
  const contentDisposition =
    backendRes.headers.get("Content-Disposition") ??
    'attachment; filename="profiles.csv"';

  return new NextResponse(backendRes.body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": contentDisposition,
    },
  });
}
