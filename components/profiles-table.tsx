'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, Trash2, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { getProfiles, deleteProfile, Profile, ProfileFilters, ForbiddenError } from '@/lib/api';

interface ProfilesTableProps {
  filters: ProfileFilters;
  onPageChange: (page: number) => void;
  isAdmin: boolean;
}

export function ProfilesTable({ filters, onPageChange, isAdmin }: ProfilesTableProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getProfiles(filters);
      setProfiles(result.data);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total,
        total_pages: result.total_pages,
      });
    } catch (err) {
      const message =
        err instanceof ForbiddenError
          ? 'Insufficient permissions'
          : 'Failed to load profiles';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [filters]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;

    try {
      setDeleting(id);
      setDeleteError(null);
      await deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const message =
        err instanceof ForbiddenError
          ? 'Insufficient permissions'
          : 'Failed to delete profile';
      setDeleteError(message);
    } finally {
      setDeleting(null);
    }
  };

  const start = (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div>
      {error && (
        <Card className="p-4 mb-4 bg-red-50 border border-red-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
          <Button
            onClick={fetchProfiles}
            variant="outline"
            size="sm"
            className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </Card>
      )}

      {deleteError && (
        <Card className="p-4 mb-4 bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-red-700">{deleteError}</p>
        </Card>
      )}

      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow>
              <TableHead className="text-slate-700 font-semibold">Name</TableHead>
              <TableHead className="text-slate-700 font-semibold">Gender</TableHead>
              <TableHead className="text-slate-700 font-semibold">Gender Prob</TableHead>
              <TableHead className="text-slate-700 font-semibold">Age</TableHead>
              <TableHead className="text-slate-700 font-semibold">Age Group</TableHead>
              <TableHead className="text-slate-700 font-semibold">Country</TableHead>
              <TableHead className="text-slate-700 font-semibold">Created At</TableHead>
              {isAdmin && <TableHead className="text-slate-700 font-semibold">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-slate-100">
                  <TableCell colSpan={isAdmin ? 8 : 7} className="py-4">
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 8 : 7}
                  className="text-center py-8 text-slate-500"
                >
                  No profiles found
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow
                  key={profile.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
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
                  <TableCell>
                    <ProbabilityBadge value={profile.gender_probability} />
                  </TableCell>
                  <TableCell className="text-slate-700">{profile.age}</TableCell>
                  <TableCell className="text-slate-700">{profile.age_group}</TableCell>
                  <TableCell className="text-slate-700">
                    {profile.country_name} ({profile.country_id})
                  </TableCell>
                  <TableCell className="text-slate-600 text-sm">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <button
                        onClick={() => handleDelete(profile.id)}
                        disabled={deleting === profile.id}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {!loading && profiles.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {start}–{end} of {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm text-slate-600">
              Page {pagination.page} of {pagination.total_pages}
            </span>
            <Button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProbabilityBadge({ value }: { value: number }) {
  let bgColor = 'bg-red-100 text-red-800';
  if (value > 0.8) bgColor = 'bg-green-100 text-green-800';
  else if (value >= 0.5) bgColor = 'bg-yellow-100 text-yellow-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {(value * 100).toFixed(0)}%
    </span>
  );
}
