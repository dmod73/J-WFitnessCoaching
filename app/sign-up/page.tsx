'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json().catch(() => null)) ?? {};

      if (!response.ok) {
        setMessage((payload as { error?: string }).error ?? 'No pudimos crear tu cuenta.');
        return;
      }

      router.replace('/sign-in?registered=1');
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
          <span className="section-title">Unete al movimiento</span>
          <h1>Crear cuenta</h1>
          <p className="link-muted" style={{ marginTop: 4 }}>
            Accede al onboarding y empieza con un plan personalizado desde la semana uno.
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
            autoComplete="new-password"
          />
        </label>
        <label className="input-label">
          Confirmar contrasena
          <input
            className="input-field"
            placeholder="********"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            autoComplete="new-password"
          />
        </label>
        {message && <div className="message">{message}</div>}
        <button type="submit" disabled={loading} className="button primary">
          {loading ? 'Registrando...' : 'Registrarme'}
        </button>
        <p>
          Ya tienes cuenta? <Link href="/sign-in">Inicia sesion</Link>
        </p>
      </form>
    </main>
  );
}
