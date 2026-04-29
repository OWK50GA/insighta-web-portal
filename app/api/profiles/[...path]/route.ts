import { NextRequest } from "next/server";
import { handler } from "../_handler";

// Handles /api/profiles/<anything> — e.g. /api/profiles/search, /api/profiles/:id
async function routeHandler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return handler(req, `/${path.join("/")}`);
}

export const GET = routeHandler;
export const POST = routeHandler;
export const DELETE = routeHandler;
export const PUT = routeHandler;
export const PATCH = routeHandler;
