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
          background: radial-gradient(circle at top right, rgba(250, 134, 98, 0.14), transparent 60%),
            radial-gradient(circle at bottom left, rgba(250, 134, 98, 0.1), transparent 55%),
            #fdeee6;
        }

        .login-card {
          width: min(440px, 100%);
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 28px 65px rgba(250, 134, 98, 0.22);
          padding: 3rem 3rem 3.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #fa8662;
          font-weight: 700;
          letter-spacing: 0.5rem;
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
          font-size: clamp(1.9rem, 4vw, 2.4rem);
          color: #333333;
        }

        .login-intro {
          margin: 0;
          color: #5c5a57;
          line-height: 1.6;
        }

        .login-form {
          display: grid;
          gap: 1.25rem;
        }

        label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #4a4947;
          display: grid;
          gap: 0.5rem;
        }

        input {
          border-radius: 14px;
          border: 1px solid #f5cdbb;
          padding: 0.85rem 1rem;
          font-size: 1rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        input:focus {
          outline: none;
          border-color: #fa8662;
          box-shadow: 0 0 0 3px rgba(250, 134, 98, 0.18);
        }

        .login-error {
          margin: 0;
          font-size: 0.9rem;
          color: #d14343;
        }

        .login-button {
          background: linear-gradient(135deg, #fa8662, #f56b3f);
          border-radius: 999px;
          padding: 0.95rem 1.5rem;
          font-size: 1.05rem;
          font-weight: 600;
          border: none;
          color: white;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 18px 35px rgba(250, 134, 98, 0.26);
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
