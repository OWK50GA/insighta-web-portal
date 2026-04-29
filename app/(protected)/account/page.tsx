'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockUser } from '@/lib/mock';
import { logout } from '@/lib/api';

export default function AccountPage() {
  const router = useRouter();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      // TODO: clears cookies and redirects to /login
      router.push('/login');
    }
  };

  const memberSince = new Date(mockUser.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const roleBgColor = mockUser.role === 'admin' ? 'bg-blue-100' : 'bg-slate-100';
  const roleTextColor = mockUser.role === 'admin' ? 'text-blue-800' : 'text-slate-800';

  return (
    <div className="p-8 max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Account</h1>
        <p className="text-slate-600 text-sm mt-1">Manage your account settings and preferences</p>
      </div>

      {/* User Info Card */}
      <Card className="p-8 border border-slate-200 mb-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <img
            src={mockUser.avatar_url}
            alt={mockUser.username}
            className="w-24 h-24 rounded-full"
          />

          {/* User Details */}
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-600 mb-1">Username</p>
              <p className="text-xl font-bold text-slate-900">@{mockUser.username}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-slate-600 mb-1">Email</p>
              <p className="text-lg text-slate-700">{mockUser.email}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium text-slate-600 mb-2">Role</p>
              <Badge className={`${roleBgColor} ${roleTextColor} capitalize font-medium`}>
                {mockUser.role}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Member Since</p>
              <p className="text-slate-700">{memberSince}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* User ID Card */}
      <Card className="p-6 border border-slate-200 mb-8 bg-slate-50">
        <p className="text-xs font-medium text-slate-600 uppercase mb-2">User ID</p>
        <p className="text-sm font-mono text-slate-700 break-all">{mockUser.id}</p>
      </Card>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="destructive"
        size="lg"
        className="w-full"
      >
        Logout
      </Button>
    </div>
  );
}
