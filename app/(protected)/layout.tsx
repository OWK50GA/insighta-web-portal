import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { SessionProvider } from '@/lib/session-context';
import { Sidebar } from '@/components/sidebar';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const user = await getSession(cookieHeader);

  if (!user) {
    redirect('/login');
  }

  return (
    <SessionProvider user={user}>
      <div className="flex h-screen bg-white">
        <Sidebar user={user} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
