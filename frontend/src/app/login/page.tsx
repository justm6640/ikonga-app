'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

interface LoginResponse {
  token?: string;
  user?: unknown;
  message?: string;
}

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

    const existingToken = localStorage.getItem('token');
    if (existingToken) {
      router.replace('/');
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
        const message = data.message ?? 'Connexion impossible. Vérifiez vos identifiants.';
        throw new Error(message);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('ikonga_user', JSON.stringify(data.user ?? {}));
      }

      router.push('/');
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : null;
      setError(message ?? 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link href="/" className="back-link" aria-label="Retour à l\'accueil">
          ← Retour
        </Link>
        <h1>Connexion IKONGA</h1>
        <p className="subtitle">Connecte-toi pour accéder à ton programme personnalisé.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email" className="field-label">
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
          <label htmlFor="password" className="field-label">
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
            <p role="alert" className="error-message">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>
      </div>
      <style jsx>{`
        .login-page {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem 4rem;
          background: linear-gradient(160deg, #fdeee6 0%, #fff7f2 50%, #ffffff 100%);
        }

        .login-card {
          width: min(420px, 100%);
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 24px 55px rgba(250, 134, 98, 0.2);
          padding: 2.75rem 2.5rem 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .back-link {
          align-self: flex-start;
          font-size: 0.95rem;
          font-weight: 500;
          color: #fa8662;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .back-link:hover,
        .back-link:focus-visible {
          opacity: 0.7;
        }

        h1 {
          margin: 0;
          font-size: clamp(1.9rem, 3vw, 2.4rem);
          font-weight: 600;
          color: #1f2937;
        }

        .subtitle {
          margin: 0;
          color: #6b7280;
          line-height: 1.6;
        }

        .login-form {
          display: grid;
          gap: 1.4rem;
        }

        .field-label {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          font-size: 0.95rem;
          font-weight: 500;
          color: #1f2937;
        }

        input {
          border: 1px solid #f2f4f7;
          border-radius: 14px;
          padding: 0.85rem 1rem;
          font-size: 1rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        input:focus {
          outline: none;
          border-color: #fa8662;
          box-shadow: 0 0 0 3px rgba(250, 134, 98, 0.18);
        }

        .error-message {
          margin: 0;
          padding: 0.85rem 1rem;
          border-radius: 12px;
          background: rgba(220, 38, 38, 0.08);
          color: #b91c1c;
          font-size: 0.95rem;
        }

        .submit-button {
          border: none;
          border-radius: 999px;
          padding: 0.9rem 1.6rem;
          background: #fa8662;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .submit-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 36px rgba(250, 134, 98, 0.25);
        }

        .submit-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 640px) {
          .login-card {
            padding: 2.25rem 1.75rem 2.5rem;
            border-radius: 20px;
          }
        }
      `}</style>
    </div>
  );
}
