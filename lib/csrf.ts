/**
 * CSRF token utility for the Insighta Labs+ web portal.
 *
 * The backend sets a readable (non-HTTP-only) cookie named `csrf_token`.
 * This module reads that value so the API client can attach it as the
 * `X-CSRF-Token` header on every mutating request (POST, PUT, PATCH, DELETE).
 */

/**
 * Reads the `csrf_token` cookie value from the browser's document.cookie.
 *
 * Returns `null` when:
 * - Running server-side (no `document` global)
 * - The `csrf_token` cookie is absent
 */
export function getCsrfToken(): string | null {
  // Server-side: document is not available
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}
