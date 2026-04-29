'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { logout } from '@/lib/api';
import { useSession } from '@/lib/session-context';

export default function AccountPage() {
  const router = useRouter();
  const user = useSession();

  const handleLogout = async () => {
    await logout();
    router.push('/login?logout=1');
  };

  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const roleBgColor = user.role === 'admin' ? 'bg-blue-100' : 'bg-slate-100';
  const roleTextColor = user.role === 'admin' ? 'text-blue-800' : 'text-slate-800';

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Account</h1>
        <p className="text-slate-600 text-sm mt-1">Manage your account settings and preferences</p>
      </div>

      <Card className="p-8 border border-slate-200 mb-8">
        <div className="flex items-start gap-6">
          <Image
            src={user.avatar_url || 'https://avatars.githubusercontent.com/u/0'}
            alt={user.username}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full"
          />
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-600 mb-1">Username</p>
              <p className="text-xl font-bold text-slate-900">@{user.username}</p>
            </div>
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-600 mb-1">Email</p>
              <p className="text-lg text-slate-700">{user.email ?? '—'}</p>
            </div>
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-600 mb-2">Role</p>
              <Badge className={`${roleBgColor} ${roleTextColor} capitalize font-medium`}>
                {user.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Member Since</p>
              <p className="text-slate-700">{memberSince}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 border border-slate-200 mb-8 bg-slate-50">
        <p className="text-xs font-medium text-slate-600 uppercase mb-2">User ID</p>
        <p className="text-sm font-mono text-slate-700 break-all">{user.id}</p>
      </Card>

      <Button onClick={handleLogout} variant="destructive" size="lg" className="w-full">
        Logout
      </Button>
    </div>
  );
}
