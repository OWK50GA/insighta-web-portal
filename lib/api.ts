"use server";

import { mockProfiles, mockPagination } from "./mock";

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

export interface ProfileFilters {
  gender?: string;
  age_group?: string;
  country?: string;
  min_age?: number;
  max_age?: number;
  sort_by?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProfiles(filters: ProfileFilters = {}) {
  await delay(500);
  // TODO: replace mock return with real fetch call
  // GET /api/profiles with X-API-Version: 1 header
  // credentials: 'include' for cookies
  // TODO: read csrf_token cookie and add as X-CSRF-Token header
  let filtered = [...mockProfiles];

  if (filters.gender && filters.gender !== "All") {
    filtered = filtered.filter((p) => p.gender === filters.gender);
  }
  if (filters.age_group && filters.age_group !== "All") {
    filtered = filtered.filter((p) => p.age_group === filters.age_group);
  }
  if (filters.country) {
    filtered = filtered.filter(
      (p) =>
        p.country_id.toLowerCase() === filters.country?.toLowerCase() ||
        p.country_name.toLowerCase().includes(filters.country?.toLowerCase() || "")
    );
  }
  if (filters.min_age !== undefined) {
    filtered = filtered.filter((p) => p.age >= filters.min_age!);
  }
  if (filters.max_age !== undefined) {
    filtered = filtered.filter((p) => p.age <= filters.max_age!);
  }

  if (filters.sort_by) {
    filtered.sort((a, b) => {
      let aVal = (a as any)[filters.sort_by!];
      let bVal = (b as any)[filters.sort_by!];
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });
  }

  if (filters.order === "desc") {
    filtered.reverse();
  }

  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const start = (page - 1) * limit;
  const paginatedData = filtered.slice(start, start + limit);

  return {
    data: paginatedData,
    page,
    limit,
    total: filtered.length,
    total_pages: Math.ceil(filtered.length / limit),
    links: {
      self: `/api/profiles?page=${page}&limit=${limit}`,
      next: page * limit < filtered.length ? `/api/profiles?page=${page + 1}&limit=${limit}` : null,
      prev: page > 1 ? `/api/profiles?page=${page - 1}&limit=${limit}` : null,
    },
  };
}

export async function getProfileById(id: string) {
  await delay(300);
  // TODO: replace mock return with real fetch call
  // GET /api/profiles/:id with X-API-Version: 1 header
  // credentials: 'include' for cookies
  const profile = mockProfiles.find((p) => p.id === id);
  if (!profile) throw new Error("Profile not found");
  return profile;
}

export async function searchProfiles(query: string) {
  await delay(500);
  // TODO: replace mock return with real fetch call
  // GET /api/profiles/search?q=<query> with X-API-Version: 1 header
  // credentials: 'include' for cookies
  const queryLower = query.toLowerCase();
  let results = mockProfiles.filter(
    (p) =>
      p.name.toLowerCase().includes(queryLower) ||
      p.gender.toLowerCase().includes(queryLower) ||
      p.age_group.toLowerCase().includes(queryLower) ||
      p.country_name.toLowerCase().includes(queryLower)
  );

  return {
    data: results,
    page: 1,
    limit: results.length,
    total: results.length,
    total_pages: 1,
    links: {
      self: `/api/profiles/search?q=${query}`,
      next: null,
      prev: null,
    },
  };
}

export async function createProfile(name: string) {
  await delay(800);
  // TODO: replace mock return with real fetch call
  // POST /api/profiles with body { name: "..." }
  // include header: X-API-Version: 1
  // TODO: read csrf_token cookie and add as X-CSRF-Token header
  // credentials: 'include' for cookies
  const newProfile: Profile = {
    id: `prof-${Date.now()}`,
    name,
    gender: Math.random() > 0.5 ? "Male" : "Female",
    gender_probability: 0.85 + Math.random() * 0.14,
    age: Math.floor(Math.random() * 60) + 18,
    age_group: ["Adult", "Senior"][Math.floor(Math.random() * 2)],
    country_id: ["US", "NG", "IN", "BR", "MX"][Math.floor(Math.random() * 5)],
    country_name: ["United States", "Nigeria", "India", "Brazil", "Mexico"][
      Math.floor(Math.random() * 5)
    ],
    country_probability: 0.8 + Math.random() * 0.19,
    created_at: new Date().toISOString(),
  };
  return newProfile;
}

export async function deleteProfile(id: string) {
  await delay(400);
  // TODO: replace mock return with real fetch call
  // DELETE /api/profiles/:id with admin token
  // TODO: read csrf_token cookie and add as X-CSRF-Token header
  // credentials: 'include' for cookies
  return { success: true, id };
}

export async function logout() {
  // TODO: logout calls POST /auth/logout with the refresh token
  // then clears cookies and redirects to /login
  return { success: true };
}
