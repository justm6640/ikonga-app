'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginResponse {
  token?: string;
  user?: Record<string, unknown>;
  message?: string;
}

const API_ERROR_MESSAGE = 'Connexion impossible. Vérifiez vos identifiants.';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('ikonga_token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Merci de renseigner votre email et votre mot de passe.');
      return;
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

    if (!apiBaseUrl) {
      setError('Configuration manquante : NEXT_PUBLIC_API_URL est requis.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json().catch(() => ({}));

      if (!response.ok || !data.token) {
        throw new Error(data.message ?? API_ERROR_MESSAGE);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('ikonga_token', data.token);
        localStorage.setItem('ikonga_user', JSON.stringify(data.user ?? {}));
      }

      router.replace('/dashboard');
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : API_ERROR_MESSAGE;
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-container">
      <div className="auth-card" role="main">
        <div className="auth-brand" aria-hidden="true">
          <span className="auth-brand-mark">IK</span>
          <span className="auth-brand-name">Ikonga</span>
        </div>
        <header className="auth-heading">
          <h1>Connexion</h1>
          <p>Accède à ton espace Ikonga pour suivre tes programmes nutrition et fitness.</p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="email">
            Adresse email
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="vous@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              required
            />
          </label>
          <label htmlFor="password">
            Mot de passe
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
              required
            />
          </label>
          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>
        <div className="auth-actions">
          <Link href="/forgot-password" className="forgot-link">
            Mot de passe oublié ?
          </Link>
          <button
            type="button"
            className="auth-secondary"
            onClick={() => router.push('/register')}
          >
            Créer un compte
          </button>
        </div>
      </div>
      <style jsx>{`
        .auth-container {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          background: #fff7f2;
          border-radius: 24px;
          padding: 2.5rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          box-shadow: 0 20px 45px rgba(250, 134, 98, 0.18);
        }

        .auth-brand {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          align-items: center;
          text-transform: uppercase;
          letter-spacing: 0.32em;
          color: #3d342f;
        }

        .auth-brand-mark {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: linear-gradient(135deg, #fa8662 0%, #e95f37 100%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: normal;
        }

        .auth-brand-name {
          font-size: 1rem;
          font-weight: 600;
        }

        .auth-heading {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          text-align: center;
          color: #2f2622;
        }

        .auth-heading h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 600;
        }

        .auth-heading p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.6;
          color: #5f524d;
        }

        .auth-form {
          display: grid;
          gap: 1.25rem;
        }

        label {
          display: grid;
          gap: 0.5rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: #2f2622;
        }

        input {
          appearance: none;
          border: 1px solid #f2c3b0;
          border-radius: 14px;
          padding: 0.85rem 1rem;
          font-size: 1rem;
          background: #ffffff;
          color: #2f2622;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        input::placeholder {
          color: #9a8a83;
        }

        input:focus {
          outline: none;
          border-color: #fa8662;
          box-shadow: 0 0 0 3px rgba(250, 134, 98, 0.28);
        }

        .auth-error {
          margin: 0;
          font-size: 0.92rem;
          color: #b3261e;
          background: rgba(179, 38, 30, 0.12);
          padding: 0.75rem 1rem;
          border-radius: 12px;
        }

        .auth-submit {
          border-radius: 999px;
          padding: 0.95rem 1.5rem;
          background: linear-gradient(135deg, #fa8662 0%, #e95f37 100%);
          color: #ffffff;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 18px 32px rgba(250, 134, 98, 0.25);
        }

        .auth-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @media (min-width: 640px) {
          .auth-card {
            padding: 3rem 2.5rem;
          }

          .auth-heading h1 {
            font-size: 2.2rem;
          }
        }
      `}</style>
    </section>
  );
}
