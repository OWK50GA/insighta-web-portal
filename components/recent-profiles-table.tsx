'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getProfiles, Profile } from '@/lib/api';

export function RecentProfilesTable() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // TODO: fetch from GET /api/profiles?limit=5&page=1
        const result = await getProfiles({ limit: 5, page: 1 });
        setProfiles(result.data);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <Card className="border border-slate-200 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50 border-b border-slate-200">
          <TableRow>
            <TableHead className="text-slate-700 font-semibold">Name</TableHead>
            <TableHead className="text-slate-700 font-semibold">Gender</TableHead>
            <TableHead className="text-slate-700 font-semibold">Age</TableHead>
            <TableHead className="text-slate-700 font-semibold">Country</TableHead>
            <TableHead className="text-slate-700 font-semibold">Age Group</TableHead>
            <TableHead className="text-slate-700 font-semibold">Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-b border-slate-100">
                <TableCell colSpan={6} className="py-4">
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : profiles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                No profiles found
              </TableCell>
            </TableRow>
          ) : (
            profiles.map((profile) => (
              <TableRow
                key={profile.id}
                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <TableCell>
                  <Link
                    href={`/profiles/${profile.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {profile.name}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-700">{profile.gender}</TableCell>
                <TableCell className="text-slate-700">{profile.age}</TableCell>
                <TableCell className="text-slate-700">
                  {profile.country_name} ({profile.country_id})
                </TableCell>
                <TableCell className="text-slate-700">{profile.age_group}</TableCell>
                <TableCell className="text-slate-600 text-sm">
                  {new Date(profile.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
