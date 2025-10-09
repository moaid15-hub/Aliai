'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/chat" className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="text-xl font-bold text-gray-900">Oqool AI</span>
        </Link>

        {/* User Menu */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user.full_name || user.email}
                </p>
                <p className="text-xs text-gray-500">
                  {user.monthly_tokens_used.toLocaleString()} /{' '}
                  {user.monthly_tokens_limit.toLocaleString()} توكن
                </p>
              </div>

              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white">
                  {user.full_name?.[0]?.toUpperCase() ||
                    user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-sm"
              >
                خروج
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


