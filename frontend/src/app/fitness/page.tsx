'use client';

import { useEffect, useState } from 'react';

interface FitnessWorkout {
  id?: string | number;
  title?: string;
  description?: string;
  duration?: string | number;
  level?: string;
  [key: string]: unknown;
}

interface FitnessResponse {
  workouts?: FitnessWorkout[];
  sessions?: FitnessWorkout[];
  message?: string;
}

const ENDPOINT = 'http://localhost:4000/api/fitness/workouts';

export default function FitnessPage() {
  const [workouts, setWorkouts] = useState<FitnessWorkout[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(ENDPOINT, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });

        const payload: FitnessResponse | FitnessWorkout[] = await response
          .json()
          .catch(() => []);

        if (!response.ok) {
          const message =
            (payload as FitnessResponse).message ??
            'Impossible de récupérer les entraînements fitness.';
          throw new Error(message);
        }

        const resolvedWorkouts = Array.isArray(payload)
          ? payload
          : payload.workouts ?? payload.sessions ?? [];

        setWorkouts(resolvedWorkouts);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return;
        }
        const message = fetchError instanceof Error ? fetchError.message : undefined;
        setError(message ?? 'Impossible de récupérer les entraînements fitness.');
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
      <h1>Module fitness</h1>
      <p>Explorez les entraînements proposés par votre coach pour rester actif au quotidien.</p>
      {loading ? <p>Chargement des entraînements...</p> : null}
      {!loading && error ? (
        <div className="status-message error" role="alert">
          {error}
        </div>
      ) : null}
      {!loading && !error ? (
        workouts.length > 0 ? (
          <div className="list-card" role="list">
            {workouts.map((workout, index) => (
              <article className="list-item" key={workout.id ?? index} role="listitem">
                <h3>{workout.title ?? 'Séance fitness'}</h3>
                {workout.description ? <p>{workout.description}</p> : null}
                {workout.duration ? <p>Durée : {workout.duration}</p> : null}
                {workout.level ? <p>Niveau : {workout.level}</p> : null}
              </article>
            ))}
          </div>
        ) : (
          <p>Aucun entraînement n'est disponible pour le moment.</p>
        )
      ) : null}
    </section>
  );
}
