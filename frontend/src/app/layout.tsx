import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Ikonga App',
  description: 'Frontend Next.js application for Ikonga',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
