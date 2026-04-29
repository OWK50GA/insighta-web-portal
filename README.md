# Insighta Labs+ — Web Portal

A Next.js 16 web portal for the Insighta Labs+ platform. Provides authenticated access to profile management with role-based access control, GitHub OAuth, and real-time data from the Insighta backend API.

---

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Toasts**: Sonner
- **Analytics**: Vercel Analytics

---

## System Architecture

```
app/
├── (protected)/              # Authenticated routes — guarded by middleware + server layout
│   ├── layout.tsx            # Server component: fetches session, provides SessionContext
│   ├── dashboard/            # Dashboard with total profile count and recent profiles
│   ├── profiles/             # Browse, filter, paginate, and export profiles
│   │   └── [id]/             # Profile detail view with admin delete
│   ├── search/               # Natural language profile search
│   ├── create/               # Create new profiles (admin only)
│   └── account/              # Account info and logout
├── login/                    # Login page — GitHub OAuth entry point
├── api/
│   ├── auth/
│   │   ├── refresh/          # POST — reads httpOnly refresh_token, exchanges with backend
│   │   └── logout/           # POST — reads httpOnly refresh_token, revokes session, clears cookies
│   └── profiles/
│       └── export/           # GET — proxies CSV export, injects required headers
└── layout.tsx                # Root layout

components/
├── sidebar.tsx               # Navigation sidebar (role-aware: hides Create for analysts)
├── profiles-table.tsx        # Profiles list with pagination, filters, inline delete
├── recent-profiles-table.tsx # Recent profiles for dashboard
├── search-results-table.tsx  # Search results display
└── ui/                       # shadcn/ui components

lib/
├── api.ts                    # Fetch-based API client (fetchWithAuth, all API functions)
├── session.ts                # Server-side session helper (getSession, requireSession)
├── session-context.tsx       # React context — exposes SessionUser to client components
├── csrf.ts                   # getCsrfToken() — reads csrf_token cookie for mutating requests
├── errors.ts                 # Typed error classes (ApiError, ForbiddenError, etc.)
└── utils.ts                  # cn() utility

middleware.ts                 # Edge middleware — route guarding and silent token refresh
```

---

## Authentication

The portal uses GitHub OAuth with HTTP-only cookies. No tokens are ever accessible to JavaScript.

### Login flow

1. User clicks "Continue with GitHub" on `/login`
2. Browser navigates to `GET /auth/github` on the backend
3. Backend generates PKCE params, redirects to GitHub
4. GitHub redirects to `GET /auth/github/callback` on the backend
5. Backend exchanges the code, upserts the user, sets three cookies, and redirects to `/dashboard`:
   - `access_token` — httpOnly, SameSite=Strict, 3-minute TTL
   - `refresh_token` — httpOnly, SameSite=Strict, 5-minute TTL
   - `csrf_token` — readable (non-httpOnly), for CSRF double-submit

### Session management

The `access_token` cookie is sent automatically by the browser on every request via `credentials: 'include'`. The portal never reads or stores the token value in JavaScript.

### Token refresh

When the access token expires (3 minutes), the middleware intercepts the next request and silently refreshes:

1. Middleware detects no `access_token` cookie but finds a `refresh_token` cookie
2. Calls `POST /auth/refresh` on the backend with the refresh token in the request body
3. On success: sets new `access_token` and `refresh_token` cookies, redirects to the same URL
4. On failure: clears all session cookies and redirects to `/login`

Client-side 401 responses are handled by `fetchWithAuth` via the `POST /api/auth/refresh` Next.js route handler (which reads the httpOnly cookie server-side and forwards it to the backend).

### Logout

Logout calls `POST /api/auth/logout` (Next.js route handler) which:
1. Reads the `refresh_token` httpOnly cookie server-side
2. Forwards it to `POST /auth/logout` on the backend (best-effort)
3. Clears all three session cookies regardless of backend response
4. Redirects to `/login?logout=1`

---

## Middleware

`middleware.ts` runs on the Edge runtime and intercepts every request to `/`, `/login`, and `/(protected)/*`.

| Route | Behaviour |
|---|---|
| `/` | Authenticated → redirect to `/dashboard`. Refresh token only → silent refresh → `/dashboard`. Neither → `/login`. |
| `/login` | Authenticated → redirect to `/dashboard`. Refresh token only → silent refresh → `/dashboard`. Neither → render login page. |
| `/(protected)/*` | Authenticated → pass through. Refresh token only → silent refresh → redirect to same URL. Neither → `/login`. |

---

## API Client (`lib/api.ts`)

All API calls go through `fetchWithAuth`, which:

- Sends `credentials: 'include'` on every request (browser sends cookies automatically)
- Attaches `X-API-Version: 1` on all `/api/*` requests
- Reads `csrf_token` cookie and attaches `X-CSRF-Token` on POST/PUT/PATCH/DELETE
- On **401**: calls `POST /api/auth/refresh`, retries the original request once
- On **403**: throws `ForbiddenError`
- On **404**: throws `NotFoundError`
- On **429**: shows a `sonner` toast with the `Retry-After` seconds, throws `RateLimitError`
- On other non-2xx: throws `ApiError`

Concurrent 401 responses are serialised — only one refresh call is made regardless of how many requests fail simultaneously.

### CSV export

The export button calls `buildExportUrl(filters)` which points to `GET /api/profiles/export` — a Next.js route handler that proxies the request to the backend, injecting `X-API-Version: 1` and forwarding the session cookie. This is necessary because `window.location.href` cannot send custom headers.

---

## Role-Based Access

| Role | Permissions |
|---|---|
| `analyst` | View profiles, search, export CSV, view account |
| `admin` | Everything analyst can do + create profiles, delete profiles |

Role is derived from the live session (`GET /auth/me`) — never from client-side state. The sidebar hides "Create Profile" for analysts. The profile detail page hides the "Delete" button for analysts. Navigating directly to `/create` as an analyst redirects to `/dashboard`.

---

## Pages

| Route | Description |
|---|---|
| `GET /` | Redirects to `/dashboard` or `/login` based on session |
| `GET /login` | GitHub OAuth entry point. Shows logout confirmation (`?logout=1`) and error messages (`?error=`) |
| `GET /dashboard` | Total profile count + 5 most recent profiles |
| `GET /profiles` | Browse profiles with filters (gender, age group, country, age range, sort) and pagination |
| `GET /profiles/[id]` | Full profile detail. Admin-only delete button |
| `GET /search` | Natural language search |
| `GET /create` | Create profile by name (admin only — analysts are redirected) |
| `GET /account` | Live session info (username, email, role, avatar, member since) + logout |

---

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

---

## Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Visit `http://localhost:3000`. The root route redirects to `/dashboard` if authenticated, or `/login` if not.

---

## Error Handling

- **Loading states**: skeleton loaders on all data-fetching pages
- **API errors**: inline error cards with retry buttons (no full-page crashes)
- **403**: "Insufficient permissions" message
- **404** (profile detail): "Profile not found" with a link back to the profiles list
- **429**: toast notification with retry countdown (no auto-retry)
- **Session expired**: automatic redirect to `/login`
- **Missing CSRF token**: error message instructing the user to reload the page

---

## Probability Badges

Confidence levels are colour-coded throughout the UI:

| Colour | Range | Label |
|---|---|---|
| Green | > 80% | High |
| Yellow | 50–80% | Medium |
| Red | < 50% | Low |
