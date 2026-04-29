/**
 * Typed error classes for the Insighta Labs+ API client.
 * All errors carry an HTTP status code and a human-readable message.
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
    // Restore prototype chain for instanceof checks in transpiled code
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Thrown when the backend returns 403 Forbidden. */
export class ForbiddenError extends ApiError {
  constructor(message = 'Insufficient permissions') {
    super(403, message);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Thrown when the backend returns 404 Not Found. */
export class NotFoundError extends ApiError {
  constructor(message = 'Not found') {
    super(404, message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the backend returns 429 Too Many Requests.
 * `retryAfter` is the number of seconds to wait before retrying,
 * parsed from the `Retry-After` response header, or null if absent.
 */
export class RateLimitError extends ApiError {
  constructor(
    message: string,
    public readonly retryAfter: number | null,
  ) {
    super(429, message);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
