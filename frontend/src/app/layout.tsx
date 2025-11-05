import './globals.css';
import type { ReactNode } from 'react';
import { Poppins } from 'next/font/google';
import { AppHeader } from '../components/AppHeader';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Ikonga',
  description: "Plateforme d'accompagnement Ikonga",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={poppins.className}>
      <body>
        <div className="app-shell">
          <AppHeader />
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
