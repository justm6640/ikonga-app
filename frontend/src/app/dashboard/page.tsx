'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

interface StoredUser {
  email?: string;
  role?: string;
  phase?: string;
  phase_current?: string;
  [key: string]: unknown;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('ikonga_token');

    if (!token) {
      router.replace('/login');
      return;
    }

    const storedUser = localStorage.getItem('ikonga_user');

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as StoredUser;
        setUser(parsed);
      } catch (error) {
        console.error('Impossible de parser ikonga_user depuis le stockage local', error);
        setUser(null);
      }
    }
  }, [router]);

  const phase = useMemo(() => {
    if (!user) {
      return 'Non renseignée';
    }

    if (typeof user.phase === 'string' && user.phase.trim().length > 0) {
      return user.phase;
    }

    if (typeof user.phase_current === 'string' && user.phase_current.trim().length > 0) {
      return user.phase_current;
    }

    return 'Non renseignée';
  }, [user]);

  const role = useMemo(() => {
    if (!user) {
      return 'Membre';
    }

    if (typeof user.role === 'string' && user.role.trim().length > 0) {
      return user.role;
    }

    return 'Membre';
  }, [user]);

  const email = useMemo(() => {
    if (!user) {
      return 'membre';
    }

    if (typeof user.email === 'string' && user.email.trim().length > 0) {
      return user.email;
    }

    return 'membre';
  }, [user]);

  return (
    <section className="page-card" role="main">
      <div className="dashboard-heading">
        <h1>Bonjour {email}</h1>
        <p>
          Retrouve un aperçu de ta progression bien-être, tes recommandations sur-mesure et les
          prochaines actions proposées par ton coach.
        </p>
      </div>

      <div className="dashboard-meta">
        <div className="meta-tile">
          <span>Phase actuelle</span>
          <strong>{phase}</strong>
        </div>
        <div className="meta-tile">
          <span>Rôle</span>
          <strong>{role}</strong>
        </div>
        <div className="meta-tile">
          <span>Statut</span>
          <strong>Actif</strong>
        </div>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card">
          <h3>Nutrition</h3>
          <p>
            Explore tes plans nutritionnels personnalisés, des recettes équilibrées et des conseils
            pour maintenir ton énergie tout au long de la semaine.
          </p>
        </article>
        <article className="dashboard-card">
          <h3>Fitness</h3>
          <p>
            Suis tes entraînements, mesure ta progression et découvre des séances adaptées à ton
            niveau et à tes objectifs.
          </p>
        </article>
        <article className="dashboard-card">
          <h3>Bien-être</h3>
          <p>
            Accède à des routines de relaxation, des astuces sommeil et des pratiques mindfulness
            pour équilibrer corps et esprit.
          </p>
        </article>
      </div>
    </section>
  );
}
