'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Search,
  Settings,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { logout } from '@/lib/api';
import { useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'analyst';
  avatar_url: string;
  created_at: string;
}

export function Sidebar({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/login?logout=1');
  };

  useEffect(() => {
    console.log(user);
  })

  const isActive = (href: string) => pathname === href;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/profiles', label: 'Profiles', icon: Users },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/account', label: 'Account', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Insighta Labs+</h2>
        <p className="text-xs text-slate-400 mt-1">Profile Intelligence</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            </Link>
          );
        })}

        {/* Admin-only items */}
        {user.role === 'admin' && (
          <Link href="/create">
            <button
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                isActive('/create')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              Create Profile
            </button>
          </Link>
        )}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Image
            src={user.avatar_url || `https://avatars.githubusercontent.com/u/0`}
            alt={user.username}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.username}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="w-full justify-start text-slate-300 border-slate-700 hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
