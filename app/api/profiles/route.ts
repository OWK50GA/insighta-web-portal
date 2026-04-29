import { NextRequest } from "next/server";
import { handler } from "./_handler";

// Handles GET /api/profiles and POST /api/profiles (no trailing path segment)
export const GET = (req: NextRequest) => handler(req, "");
export const POST = (req: NextRequest) => handler(req, "");
