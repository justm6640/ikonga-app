'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

const NAVIGATION = [
  { href: '/', label: 'Accueil' },
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/nutrition', label: 'Nutrition' },
  { href: '/fitness', label: 'Fitness' },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const activePath = useMemo(() => {
    if (!pathname) {
      return '/';
    }

    if (pathname.startsWith('/dashboard')) {
      return '/dashboard';
    }
    if (pathname.startsWith('/nutrition')) {
      return '/nutrition';
    }
    if (pathname.startsWith('/fitness')) {
      return '/fitness';
    }
    return '/';
  }, [pathname]);

  const handleLogout = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem('ikonga_token');
    localStorage.removeItem('ikonga_user');
    router.replace('/login');
  }, [router]);

  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark">IK</span>
        <span className="brand-name">Ikonga</span>
      </div>
      <nav className="app-nav" aria-label="Navigation principale">
        {NAVIGATION.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link${activePath === item.href ? ' is-active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button type="button" className="logout-button" onClick={handleLogout}>
        Déconnexion
      </button>
    </header>
  );
}
