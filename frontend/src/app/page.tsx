'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('ikonga_token');

    if (token) {
      router.replace('/dashboard');
      return;
    }

    router.replace('/login');
  }, [router]);

  return null;
}
