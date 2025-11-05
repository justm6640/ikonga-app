'use client';

import { useEffect, useState } from 'react';

interface NutritionMenu {
  id?: string | number;
  title?: string;
  description?: string;
  calories?: number;
  [key: string]: unknown;
}

interface NutritionResponse {
  menus?: NutritionMenu[];
  data?: NutritionMenu[];
  message?: string;
}

const ENDPOINT = 'http://localhost:4000/api/nutrition/menus';

export default function NutritionPage() {
  const [menus, setMenus] = useState<NutritionMenu[]>([]);
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

        const payload: NutritionResponse | NutritionMenu[] = await response
          .json()
          .catch(() => []);

        if (!response.ok) {
          const message =
            (payload as NutritionResponse).message ??
            "Impossible de récupérer les menus nutritionnels.";
          throw new Error(message);
        }

        const resolvedMenus = Array.isArray(payload)
          ? payload
          : payload.menus ?? payload.data ?? [];

        setMenus(resolvedMenus);
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          return;
        }
        const message = fetchError instanceof Error ? fetchError.message : undefined;
        setError(message ?? "Impossible de récupérer les menus nutritionnels.");
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
      <h1>Menus nutrition</h1>
      <p>Découvrez les menus pensés pour accompagner chaque phase de votre parcours Ikonga.</p>
      {loading ? <p>Chargement des menus...</p> : null}
      {!loading && error ? (
        <div className="status-message error" role="alert">
          {error}
        </div>
      ) : null}
      {!loading && !error ? (
        menus.length > 0 ? (
          <div className="list-card" role="list">
            {menus.map((menu, index) => (
              <article className="list-item" key={menu.id ?? index} role="listitem">
                <h3>{menu.title ?? 'Menu personnalisé'}</h3>
                {menu.description ? <p>{menu.description}</p> : null}
                {typeof menu.calories === 'number' ? (
                  <p>Apport estimé : {menu.calories} kcal</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p>Aucun menu n'est disponible pour le moment.</p>
        )
      ) : null}
    </section>
  );
}
