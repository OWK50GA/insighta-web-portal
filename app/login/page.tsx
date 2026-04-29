'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Github } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleGitHubLogin = () => {
    // TODO: redirect to GET /auth/github
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <Card className="w-full max-w-sm p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-8">
          {/* Logo/Wordmark */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Insighta Labs+</h1>
            <p className="text-sm text-slate-400">Internal platform for profile intelligence</p>
          </div>

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
