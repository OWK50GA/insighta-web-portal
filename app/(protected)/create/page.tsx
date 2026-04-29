"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { createProfile, Profile, ForbiddenError } from "@/lib/api";
import { useSession } from "@/lib/session-context";

export default function CreateProfilePage() {
  const router = useRouter();
  const user = useSession();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProfile, setCreatedProfile] = useState<Profile | null>(null);

  // Redirect analysts — server-side middleware also enforces this
  useEffect(() => {
    if (user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user.role, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const profile = await createProfile(name);
      setCreatedProfile(profile);
      setName("");
    } catch (err) {
      if (err instanceof ForbiddenError) {
        setError("Insufficient permissions");
      } else {
        setError((err as Error).message || "Failed to create profile");
      }
    } finally {
      setLoading(false);
    }
  };

  if (user.role !== "admin") return null;

  return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        {!createdProfile ? (
          <Card className="p-8 border border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Create Profile
            </h1>
            <p className="text-slate-600 text-sm mb-6">
              Generate a new profile in the system
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <Input
                  placeholder="e.g. Harriet Tubman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="bg-white border-slate-300"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Profile"
                )}
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-8 border border-slate-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Profile Created
              </h2>
              <p className="text-slate-600 text-sm">
                Successfully generated a new profile
              </p>
            </div>

            <div className="space-y-4 mb-6 bg-slate-50 p-4 rounded-lg">
              <div>
                <p className="text-xs font-medium text-slate-600 uppercase">
                  Name
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {createdProfile.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase">
                    Gender
                  </p>
                  <p className="font-semibold text-slate-900">
                    {createdProfile.gender}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase">
                    Age
                  </p>
                  <p className="font-semibold text-slate-900">
                    {createdProfile.age}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600 uppercase">
                  Country
                </p>
                <p className="font-semibold text-slate-900">
                  {createdProfile.country_name} ({createdProfile.country_id})
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600 uppercase">
                  ID
                </p>
                <p className="text-xs font-mono text-slate-700 bg-white p-2 rounded">
                  {createdProfile.id}
                </p>
              </div>
            </div>

            <Button
              onClick={() => router.push(`/profiles/${createdProfile.id}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-2"
            >
              View Profile
            </Button>
            <Button
              onClick={() => {
                setCreatedProfile(null);
                setName("");
              }}
              variant="outline"
              className="w-full border-slate-300"
            >
              Create Another
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
