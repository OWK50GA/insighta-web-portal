'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Github, AlertCircle, CheckCircle2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const loggedOut = searchParams.get('logout') === '1';

  const handleGitHubLogin = () => {
    // Redirect to the backend's /auth/github endpoint which handles PKCE
    // state generation and redirects to GitHub's OAuth authorization page.
    window.location.href = `${API_BASE}/auth/github`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 to-slate-900 p-4">
      <Card className="w-full max-w-sm p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-6">
          {/* Logo/Wordmark */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Insighta Labs+</h1>
            <p className="text-sm text-slate-400">Internal platform for profile intelligence</p>
          </div>

          {/* Logout confirmation */}
          {loggedOut && (
            <div className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-950 border border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
              <p className="text-sm text-green-300">You have been logged out successfully.</p>
            </div>
          )}

          {/* OAuth error message */}
          {error && (
            <div className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-950 border border-red-800">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-sm text-red-300">
                {error === 'access_denied'
                  ? 'Access was denied. Please try again.'
                  : 'Authentication failed. Please try again.'}
              </p>
            </div>
          )}

          {/* GitHub Button */}
          <Button
            onClick={handleGitHubLogin}
            size="lg"
            className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
            variant="outline"
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>

          {/* Footer */}
          <p className="text-xs text-slate-500 text-center pt-4 border-t border-slate-700 w-full">
            Access restricted to authorized personnel
          </p>
        </div>
      </Card>
    </div>
  );
}

/**
 * Login page — wrapped in Suspense because useSearchParams() requires it
 * in Next.js App Router when used in a client component.
 */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
