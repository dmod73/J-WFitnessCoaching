'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json().catch(() => null)) ?? {};

      if (!response.ok) {
        setMessage((payload as { error?: string }).error ?? 'No pudimos iniciar sesion.');
        return;
      }

      router.replace('/account');
      router.refresh();
    } catch (error) {
      setMessage('No pudimos conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 160px)' }}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <span className="section-title">Bienvenido de regreso</span>
          <h1>Iniciar sesion</h1>
          <p className="link-muted" style={{ marginTop: 4 }}>
            Ingresa con tu correo y contrasena para acceder al panel y tu plan personalizado.
          </p>
        </div>
        <label className="input-label">
          Email
          <input
            className="input-field"
            placeholder="correo@ejemplo.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label className="input-label">
          Contrasena
          <input
            className="input-field"
            placeholder="********"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {message && <div className="message">{message}</div>}
        <button type="submit" disabled={loading} className="button primary">
          {loading ? 'Ingresando...' : 'Entrar'}
        </button>
        <p>
          Aun no tienes cuenta? <Link href="/sign-up">Crear cuenta</Link>
        </p>
      </form>
    </main>
  );
}
