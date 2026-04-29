import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { DashboardClient } from "./dashboard-client";

/**
 * Dashboard page — server component.
 *
 * Fetches the live session server-side and passes the user to the client
 * component which handles the metrics and recent profiles fetching with
 * loading states.
 */
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const user = await getSession(cookieStore.toString());

  // Middleware guarantees authentication; user will not be null here
  return <DashboardClient user={user!} />;
}
