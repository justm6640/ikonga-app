'use client';

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
    <div className="login-screen">
      <div className="login-card" role="main">
        <div className="login-logo" aria-hidden="true">
          <span className="logo-mark">IK</span>
          <span className="logo-type">IKONGA</span>
        </div>
        <h1>Connexion IKONGA</h1>
        <p className="login-intro">
          Connecte-toi pour accéder à ton espace nutrition, fitness et bien-être.
        </p>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
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
            <p className="login-error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Connexion en cours…' : 'Se connecter'}
          </button>
        </form>
      </div>
      <style jsx>{`
        .login-screen {
          min-height: calc(100vh - 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem 4rem;
          background: linear-gradient(160deg, #ede9ff 0%, #f6f2ff 50%, #ffffff 100%);
        }

        .login-card {
          width: min(440px, 100%);
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 24px 55px rgba(124, 58, 237, 0.22);
          padding: 2.75rem 2.5rem 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .back-link {
          align-self: flex-start;
          font-size: 0.95rem;
          font-weight: 500;
          color: #7c3aed;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .logo-mark {
          width: 50px;
          height: 50px;
          border-radius: 18px;
          background: linear-gradient(135deg, #fa8662, #e66d47);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 1.1rem;
          letter-spacing: normal;
        }

        .logo-type {
          font-size: 1.2rem;
        }

        h1 {
          margin: 0;
          font-size: clamp(1.9rem, 3vw, 2.4rem);
          font-weight: 600;
          color: #1f1636;
        }

        .login-intro {
          margin: 0;
          color: #5d5277;
          line-height: 1.6;
        }

        .login-form {
          display: grid;
          gap: 1.25rem;
        }

        label {
          font-size: 0.95rem;
          font-weight: 500;
          color: #1f1636;
        }

        input {
          border: 1px solid #e4daff;
          border-radius: 14px;
          border: 1px solid #f5cdbb;
          padding: 0.85rem 1rem;
          font-size: 1rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        input:focus {
          outline: none;
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.18);
        }

        .login-error {
          margin: 0;
          font-size: 0.9rem;
          color: #d14343;
        }

        .login-button {
          background: linear-gradient(135deg, #fa8662, #f56b3f);
          border-radius: 999px;
          padding: 0.9rem 1.6rem;
          background: #7c3aed;
          color: white;
          font-weight: 600;
          border: none;
          color: white;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 18px 36px rgba(124, 58, 237, 0.28);
        }

        .login-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 2.5rem 1.85rem;
          }

          .login-logo {
            letter-spacing: 0.35rem;
          }
        }
      `}</style>
    </div>
  );
}
