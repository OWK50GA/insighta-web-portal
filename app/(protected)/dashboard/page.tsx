'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, BarChart3 } from 'lucide-react';
import { getProfiles } from '@/lib/api';
import { mockUser } from '@/lib/mock';
import { RecentProfilesTable } from '@/components/recent-profiles-table';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 2847,
    male: 1203,
    female: 1644,
    countries: 34,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: fetch these from GET /api/profiles?limit=1 and read total from response
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStats({
          total: 2847,
          male: 1203,
          female: 1644,
          countries: 34,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const metrics = [
    { label: 'Total Profiles', value: stats.total, icon: Users },
    { label: 'Male Profiles', value: stats.male, icon: BarChart3 },
    { label: 'Female Profiles', value: stats.female, icon: BarChart3 },
    { label: 'Countries Represented', value: stats.countries, icon: BarChart3 },
  ];

  return (
    <div className="p-8">
      {/* Welcome Header */}
      <div className="flex items-center gap-4 mb-8">
        <img
          src={mockUser.avatar_url}
          alt={mockUser.username}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, @{mockUser.username}
          </h1>
          <p className="text-sm text-slate-600">{mockUser.email}</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card
              key={index}
              className="p-6 bg-white border border-slate-200 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {metric.label}
                  </p>
                  {loading ? (
                    <Skeleton className="h-10 w-24 mt-2" />
                  ) : (
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                      {metric.value.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-slate-100 rounded-lg">
                  <Icon className="h-6 w-6 text-slate-600" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Profiles */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Profiles</h2>
        <RecentProfilesTable />
      </div>
    </div>
  );
}
