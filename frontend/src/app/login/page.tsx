'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginResponse {
  token: string;
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email || !password) {
      setError('Veuillez saisir votre email et votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json().catch(() => ({ token: '' }));

      if (!response.ok || !data.token) {
        const message = data.message ?? 'Connexion impossible. Vérifiez vos identifiants.';
        throw new Error(message);
      }

      localStorage.setItem('token', data.token);
      setSuccess(true);
      router.push('/dashboard');
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : undefined;
      setError(message ?? 'Une erreur inattendue est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-card">
      <h1>Connexion</h1>
      <p>Retrouvez vos programmes personnalisés en vous connectant à votre compte.</p>
      <form onSubmit={handleSubmit} className="form-grid">
        <label htmlFor="email">
          Email
          <input
            id="email"
            name="email"
            type="email"
            placeholder="vous@example.com"
            autoComplete="email"
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
            placeholder="********"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
            required
          />
        </label>
        {error ? (
          <div className="status-message error" role="alert">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="status-message success" role="status">
            Connexion réussie, redirection en cours...
          </div>
        ) : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </section>
  );
}
