import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * POST /api/auth/refresh
 *
 * Reads the httpOnly refresh_token cookie server-side (JS cannot access it),
 * forwards it to the backend's POST /auth/refresh endpoint in the request body,
 * then sets the new access_token and refresh_token as httpOnly cookies.
 *
 * The client-side fetchWithAuth calls this route handler on 401 so it never
 * needs to touch the token values directly.
 */
export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { status: "error", message: "No refresh token" },
      { status: 401 },
    );
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    return NextResponse.json(
      { status: "error", message: "Failed to reach auth server" },
      { status: 502 },
    );
  }

  if (!backendRes.ok) {
    // Refresh failed — tell the client to log out
    return NextResponse.json(
      { status: "error", message: "Session expired" },
      { status: 401 },
    );
  }

  const data = await backendRes.json();
  const { access_token, refresh_token: newRefreshToken } = data;

  const isProduction = process.env.NODE_ENV === "production";

  const response = NextResponse.json({ status: "success" }, { status: 200 });

  // Set the new access_token as an httpOnly cookie — 3 minutes per PRD
  response.cookies.set("access_token", access_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 3 * 60,
  });

  // Rotate the refresh_token cookie — 5 minutes per PRD
  response.cookies.set("refresh_token", newRefreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 5 * 60,
  });

  return response;
}
