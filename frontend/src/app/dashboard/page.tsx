'use client';

import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  phase_current?: string | null;
}

interface ProfileResponse {
  user?: UserProfile;
  message?: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      setError('Vous devez être connecté pour accéder au tableau de bord.');
      setLoading(false);
      return () => {
        controller.abort();
      };
    }

    (async () => {
      try {
        const response = await fetch('http://localhost:4000/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data: ProfileResponse = await response.json().catch(() => ({}));

        if (!response.ok || !data.user) {
          const message = data.message ?? 'Impossible de charger votre profil.';
          throw new Error(message);
        }

        setProfile(data.user);
      } catch (profileError) {
        if (profileError instanceof DOMException && profileError.name === 'AbortError') {
          return;
        }
        const message = profileError instanceof Error ? profileError.message : undefined;
        setError(message ?? 'Une erreur inattendue est survenue.');
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="page-card">
      <h1>Tableau de bord</h1>
      {loading ? <p>Chargement de vos informations...</p> : null}
      {!loading && error ? (
        <div className="status-message error" role="alert">
          {error}
        </div>
      ) : null}
      {!loading && !error && profile ? (
        <div>
          <p>Bonjour {profile.email}</p>
          {profile.phase_current ? (
            <p>Phase actuelle : {profile.phase_current}</p>
          ) : (
            <p>Vous n'avez pas encore défini de phase.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
