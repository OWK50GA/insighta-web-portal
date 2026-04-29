'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, mockUser } from '@/lib/mock';
import { Sidebar } from '@/components/sidebar';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // TODO: replace with actual session check from HTTP-only cookie
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar user={mockUser} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
