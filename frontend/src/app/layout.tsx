import './globals.css';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Ikonga',
  description: "Plateforme d'accompagnement Ikonga",
};

const navigation = [
  { href: '/', label: 'Accueil' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/nutrition', label: 'Nutrition' },
  { href: '/fitness', label: 'Fitness' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={poppins.className}>
      <body>
        <div className="app-shell">
          <header className="app-header">
            <div className="brand">
              <span className="brand-mark" />
              <span className="brand-name">Ikonga</span>
            </div>
            <nav className="app-nav">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
