/**
 * Insighta Labs+ API client
 *
 * All requests go through `fetchWithAuth` which handles:
 *  - credentials: 'include' so the browser sends the httpOnly access_token
 *    cookie automatically on every request
 *  - X-API-Version: 1 on every /api/* request
 *  - X-CSRF-Token on every mutating request (POST / PUT / PATCH / DELETE)
 *  - Silent token refresh on 401 with concurrency serialisation
 *    (via the Next.js route handler at /api/auth/refresh which reads the
 *    httpOnly refresh_token cookie server-side and forwards it to the backend)
 *  - Rate-limit toast on 429
 *  - Typed error classes for 403, 404, 429, and generic non-2xx
 */

import { toast } from "sonner";
import {
  ApiError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
} from "./errors";
import { getCsrfToken } from "./csrf";

export { ApiError, ForbiddenError, NotFoundError, RateLimitError };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// ---------------------------------------------------------------------------
// Token refresher (concurrency-safe)
// ---------------------------------------------------------------------------

/**
 * A single shared promise for any in-flight refresh call.
 * All concurrent 401s await the same promise instead of each firing their own
 * refresh request.
 */
let refreshPromise: Promise<void> | null = null;

/**
 * Redirects to /login. Called when a refresh attempt fails.
 */
function hardLogout(): void {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/**
 * Calls the Next.js route handler POST /api/auth/refresh.
 * That handler reads the httpOnly refresh_token cookie server-side,
 * forwards it to the backend, and the backend sets a new access_token cookie.
 *
 * On failure, hardLogout() is called.
 */
async function refreshToken(): Promise<void> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        hardLogout();
        throw new ApiError(res.status, "Session expired. Please log in again.");
      }
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Central fetch wrapper used by all exported API functions.
 *
 * In production the portal and backend are on different domains, so all
 * /api/* calls go through Next.js proxy route handlers (same origin) which
 * forward the session cookies server-side. Auth endpoints (/auth/*) are
 * called directly on the backend since they don't require cookies from the
 * browser — they're handled by server-side route handlers.
 *
 * - Sends cookies automatically via credentials: 'include'
 * - Attaches X-API-Version: 1 on /api/* paths
 * - Attaches X-CSRF-Token on mutating requests (aborts if token absent)
 * - On 401: attempts one silent token refresh then retries the request
 * - On 403: throws ForbiddenError
 * - On 404: throws NotFoundError
 * - On 429: shows a toast and throws RateLimitError (no auto-retry)
 * - On other non-2xx: throws ApiError
 */
async function fetchWithAuth(
  path: string,
  init: RequestInit = {},
  _isRetry = false,
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();

  // /api/* calls go to the same-origin Next.js proxy (no API_BASE prefix)
  // so the browser sends cookies correctly in production cross-domain setups.
  const url = path.startsWith("/api/") ? path : `${API_BASE}${path}`;

  const headers = new Headers(init.headers);

  // API versioning — required on all /api/* endpoints
  if (path.startsWith("/api/")) {
    headers.set("X-API-Version", "1");
  }

  // CSRF — required on mutating requests
  if (MUTATING_METHODS.has(method)) {
    const csrfToken = getCsrfToken();
    if (!csrfToken) {
      throw new ApiError(
        0,
        "Session error: CSRF token missing. Please reload the page.",
      );
    }
    headers.set("X-CSRF-Token", csrfToken);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  // --- 401: attempt silent refresh once ---
  if (res.status === 401) {
    if (_isRetry) {
      // Already retried — give up and redirect to login
      hardLogout();
      throw new ApiError(401, "Session expired. Please log in again.");
    }

    try {
      await refreshToken();
    } catch {
      // refreshToken already called hardLogout
      throw new ApiError(401, "Session expired. Please log in again.");
    }

    // Retry the original request — the new access_token cookie is now set
    return fetchWithAuth(path, init, true);
  }

  // --- 403: insufficient permissions ---
  if (res.status === 403) {
    throw new ForbiddenError();
  }

  // --- 404: not found ---
  if (res.status === 404) {
    throw new NotFoundError();
  }

  // --- 429: rate limited ---
  if (res.status === 429) {
    const retryAfterHeader = res.headers.get("Retry-After");
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null;
    const message = retryAfter
      ? `Rate limit reached. Try again in ${retryAfter}s.`
      : "Rate limit reached. Please wait before retrying.";
    toast(message);
    throw new RateLimitError(message, retryAfter);
  }

  // --- other non-2xx ---
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.clone().json();
      if (body?.message) message = body.message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message);
  }

  return res;
}

// ---------------------------------------------------------------------------
// Exported interfaces
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  age: number;
  age_group: string;
  country_id: string;
  country_name: string;
  country_probability: number;
  created_at: string;
}

export interface ProfilesResponse {
  status: string;
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  links: {
    self: string;
    next: string | null;
    prev: string | null;
  };
  data: Profile[];
}

export interface ProfileFilters {
  gender?: string;
  age_group?: string;
  /** ISO 3166-1 alpha-2 country code, e.g. "NG", "US" */
  country_id?: string;
  min_age?: number;
  max_age?: number;
  sort_by?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Filter serialisation helper
// ---------------------------------------------------------------------------

/**
 * Converts a ProfileFilters object to URLSearchParams, omitting keys whose
 * value is undefined, null, empty string, or the sentinel "All".
 */
export function filtersToParams(filters: ProfileFilters): URLSearchParams {
  const params = new URLSearchParams();

  const add = (key: string, value: unknown) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === "All"
    )
      return;
    params.set(key, String(value));
  };

  add("gender", filters.gender);
  add("age_group", filters.age_group);
  add("country_id", filters.country_id);
  add("min_age", filters.min_age);
  add("max_age", filters.max_age);
  add("sort_by", filters.sort_by);
  add("order", filters.order);
  add("page", filters.page);
  add("limit", filters.limit);

  return params;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

/** GET /api/profiles — list profiles with optional filters and pagination */
export async function getProfiles(
  filters: ProfileFilters = {},
): Promise<ProfilesResponse> {
  const params = filtersToParams(filters);
  const qs = params.toString();
  const res = await fetchWithAuth(`/api/profiles${qs ? `?${qs}` : ""}`);
  return res.json();
}

/** GET /api/profiles/:id — fetch a single profile by ID */
export async function getProfileById(id: string): Promise<Profile> {
  const res = await fetchWithAuth(`/api/profiles/${encodeURIComponent(id)}`);
  const body = await res.json();
  return body.data as Profile;
}

/** GET /api/profiles/search?q=<query> — natural language profile search */
export async function searchProfiles(query: string): Promise<ProfilesResponse> {
  const params = new URLSearchParams({ q: query });
  const res = await fetchWithAuth(`/api/profiles/search?${params}`);
  return res.json();
}

/** POST /api/profiles — create a new profile (admin only) */
export async function createProfile(name: string): Promise<Profile> {
  const res = await fetchWithAuth("/api/profiles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const body = await res.json();
  return body.data as Profile;
}

/** DELETE /api/profiles/:id — delete a profile (admin only) */
export async function deleteProfile(id: string): Promise<void> {
  // Backend returns 204 No Content on success
  await fetchWithAuth(`/api/profiles/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * Logout — calls the Next.js route handler which reads the httpOnly
 * refresh_token cookie server-side, forwards it to POST /auth/logout on the
 * backend, then clears all session cookies.
 */
export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

/**
 * Builds the CSV export URL pointing to the Next.js proxy route handler,
 * which injects the required headers before forwarding to the backend.
 */
export function buildExportUrl(filters: ProfileFilters): string {
  const params = filtersToParams(filters);
  params.set("format", "csv");
  return `/api/profiles/export?${params}`;
}
