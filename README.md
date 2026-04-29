# Insighta Labs+ - Next.js 16 Portal

A complete Next.js 16 web portal for managing and analyzing user profiles with role-based access control.

## Features

- **Authentication & Authorization**: Login page with GitHub OAuth (TODO), role-based dashboard
- **Dashboard**: Real-time metrics showing profile statistics with recent profiles table
- **Profile Management**: Browse, filter, and search profiles with advanced filtering options
- **Profile Details**: View detailed profile information with probability badges
- **Natural Language Search**: Search profiles using plain English queries
- **Admin Features**: Create new profiles and delete existing profiles (admin only)
- **Account Management**: User account page with logout functionality
- **Responsive Design**: Dark sidebar with light content area, mobile-friendly

## Project Structure

```
app/
├── (protected)/          # Protected routes that require authentication
│   ├── layout.tsx        # Auth wrapper with sidebar navigation
│   ├── dashboard/        # Dashboard with metrics and recent profiles
│   ├── profiles/         # Browse and filter profiles
│   │   └── [id]/         # Profile detail page
│   ├── search/           # Natural language profile search
│   ├── create/           # Create new profiles (admin only)
│   └── account/          # Account settings and logout
├── login/                # Login page
└── layout.tsx            # Root layout

components/
├── sidebar.tsx           # Navigation sidebar
├── profiles-table.tsx    # Profiles list with pagination
├── recent-profiles-table.tsx
├── search-results-table.tsx
└── ui/                   # shadcn/ui components

lib/
├── mock.ts               # Mock user and profile data
├── api.ts                # API helper functions with TODO comments
└── utils.ts              # Utility functions
```

## Mock Data & TODO Comments

All API calls are mocked with hardcoded data. The API functions in `lib/api.ts` contain TODO comments showing where to replace mock implementations with real API calls:

```typescript
export async function getProfiles(filters: ProfileFilters = {}) {
  // TODO: replace mock return with real fetch call
  // GET /api/profiles with X-API-Version: 1 header
  // credentials: 'include' for cookies
  // ...
}
```

## User Roles

### Admin
- Can view all profiles
- Can create new profiles
- Can delete profiles
- Sees "Create Profile" in sidebar

### Analyst
- Can view profiles (read-only)
- Can search and filter profiles
- Cannot create or delete profiles

## Configuration

To switch between roles, edit `lib/mock.ts`:

```typescript
export const mockUser = {
  role: "admin" // Change to "analyst" for read-only access
  // ...
}
```

To disable authentication redirect, change:

```typescript
export const isAuthenticated = true; // Change to false to test /login redirect
```

## Key Pages

- **GET /login** - Authentication page
- **GET /dashboard** - Dashboard with metrics
- **GET /profiles** - Browse profiles with filters and pagination
- **GET /profiles/[id]** - Profile detail view
- **GET /search** - Natural language search
- **GET /create** - Create new profile (admin only)
- **GET /account** - Account management

## Technologies

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React

## Getting Started

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

Visit http://localhost:3000 to see the app. The login page redirects to the dashboard with mock authentication enabled.

## Development Notes

- All components are client-side for easy mocking
- Error states are handled gracefully with alerts
- Loading states use skeleton loaders
- Pagination supports previous/next navigation
- Probability badges show color-coded confidence levels:
  - Green (>80%): High confidence
  - Yellow (50-80%): Medium confidence
  - Red (<50%): Low confidence
