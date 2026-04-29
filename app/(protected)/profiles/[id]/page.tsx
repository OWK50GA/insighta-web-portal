'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Trash2, RefreshCw } from 'lucide-react';
import { getProfileById, deleteProfile, Profile, NotFoundError, ForbiddenError } from '@/lib/api';
import { useSession } from '@/lib/session-context';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProfileDetailPage({ params }: PageProps) {
  const router = useRouter();
  const user = useSession();
  const [id, setId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolved) => setId(resolved.id));
  }, [params]);

  const fetchProfile = async (profileId: string) => {
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);
      const data = await getProfileById(profileId);
      setProfile(data);
    } catch (err) {
      if (err instanceof NotFoundError) {
        setNotFound(true);
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProfile(id);
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this profile?')) return;

    try {
      setDeleting(true);
      setDeleteError(null);
      await deleteProfile(id!);
      router.push('/profiles');
    } catch (err) {
      const message =
        err instanceof ForbiddenError
          ? 'Insufficient permissions'
          : 'Failed to delete profile';
      setDeleteError(message);
      setDeleting(false);
    }
  };

  const isAdmin = user.role === 'admin';

  return (
    <div className="p-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Not found state */}
      {notFound && (
        <Card className="p-8 border border-slate-200 text-center">
          <p className="text-lg font-semibold text-slate-900 mb-2">Profile not found</p>
          <p className="text-slate-600 mb-4">This profile may have been deleted.</p>
          <Link href="/profiles" className="text-blue-600 hover:underline font-medium">
            Back to Profiles
          </Link>
        </Card>
      )}

      {/* Generic error state */}
      {error && (
        <Card className="p-4 mb-6 bg-red-50 border border-red-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
          <Button
            onClick={() => id && fetchProfile(id)}
            variant="outline"
            size="sm"
            className="gap-2 border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        </Card>
      )}

      {/* Delete error */}
      {deleteError && (
        <Card className="p-4 mb-6 bg-red-50 border border-red-200 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-red-700">{deleteError}</p>
        </Card>
      )}

      {loading ? (
        <Card className="p-8 border border-slate-200">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="grid grid-cols-2 gap-8">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : profile ? (
        <Card className="p-8 border border-slate-200">
          <div className="flex items-start justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
            {isAdmin && (
              <Button
                onClick={handleDelete}
                disabled={deleting}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? 'Deleting...' : 'Delete Profile'}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Gender</p>
              <p className="text-lg font-semibold text-slate-900">{profile.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Gender Probability</p>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-slate-900">
                  {(profile.gender_probability * 100).toFixed(1)}%
                </span>
                <ProbabilityBadge value={profile.gender_probability} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Age</p>
              <p className="text-lg font-semibold text-slate-900">{profile.age}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Age Group</p>
              <p className="text-lg font-semibold text-slate-900">{profile.age_group}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Country</p>
              <p className="text-lg font-semibold text-slate-900">
                {profile.country_name} ({profile.country_id})
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Country Probability</p>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-slate-900">
                  {(profile.country_probability * 100).toFixed(1)}%
                </span>
                <ProbabilityBadge value={profile.country_probability} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Created At</p>
              <p className="text-lg font-semibold text-slate-900">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Profile ID</p>
              <p className="text-sm font-mono text-slate-700 bg-slate-100 p-2 rounded">
                {profile.id}
              </p>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function ProbabilityBadge({ value }: { value: number }) {
  let bgColor = 'bg-red-100 text-red-800';
  if (value > 0.8) bgColor = 'bg-green-100 text-green-800';
  else if (value >= 0.5) bgColor = 'bg-yellow-100 text-yellow-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {value > 0.8 ? 'High' : value >= 0.5 ? 'Medium' : 'Low'}
    </span>
  );
}
