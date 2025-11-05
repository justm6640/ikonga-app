'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

import { AppHeader } from './AppHeader';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  const isLoginRoute = useMemo(() => pathname === '/login', [pathname]);

  return (
    <div className={`app-shell${isLoginRoute ? ' app-shell--auth' : ''}`}>
      {!isLoginRoute ? <AppHeader /> : null}
      <main className={isLoginRoute ? 'app-main auth-main' : 'app-main'}>{children}</main>
    </div>
  );
}
