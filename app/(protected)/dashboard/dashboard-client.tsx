"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, AlertCircle, RefreshCw } from "lucide-react";
import { getProfiles, ApiError } from "@/lib/api";
import { SessionUser } from "@/lib/session";
import { RecentProfilesTable } from "@/components/recent-profiles-table";

interface DashboardClientProps {
  user: SessionUser;
}

export function DashboardClient({ user }: DashboardClientProps) {
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch just 1 record to get the total count from the pagination response
      const result = await getProfiles({ limit: 1 });
      setTotal(result.total);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to load stats";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="flex items-center gap-4 mb-8">
        <Image
          src={user.avatar_url || "https://avatars.githubusercontent.com/u/0"}
          alt={user.username}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, @{user.username}
          </h1>
          <p className="text-sm text-slate-600">{user.email}</p>
        </div>
      </div>

      {/* Metric Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Profiles
              </p>
              {loading ? (
                <Skeleton className="h-10 w-24 mt-2" />
              ) : error ? (
                <p className="text-sm text-red-600 mt-2">—</p>
              ) : (
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {total?.toLocaleString()}
                </p>
              )}
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <Users className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Error state */}
      {error && (
        <Card className="p-4 mb-8 bg-red-50 border border-red-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </Card>
      )}

      {/* Recent Profiles */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Recent Profiles
        </h2>
        <RecentProfilesTable />
      </div>
    </div>
  );
}
