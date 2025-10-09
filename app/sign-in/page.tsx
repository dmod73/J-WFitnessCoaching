'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type MessageVariant = 'info' | 'error' | 'success';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageVariant, setMessageVariant] = useState<MessageVariant>('info');
  const [loading, setLoading] = useState(false);
  const noticeAppliedRef = useRef(false);

  useEffect(() => {
    if (noticeAppliedRef.current) {
      return;
    }

    if (searchParams.get('registered')) {
      setMessage('Tu cuenta fue creada. Te enviaremos un enlace seguro para activar tu acceso.');
      setMessageVariant('info');
      noticeAppliedRef.current = true;
    } else if (searchParams.get('error') === 'verification_failed') {
      setMessage('El enlace de verificacion expiro o ya fue utilizado. Solicita uno nuevo para ingresar.');
      setMessageVariant('error');
      noticeAppliedRef.current = true;
    }
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setMessageVariant('info');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json().catch(() => null)) ?? {};

      if (!response.ok) {
        setMessage((payload as { error?: string }).error ?? 'No pudimos enviar el enlace.');
        setMessageVariant('error');
        return;
      }

      const successMessage = (payload as { message?: string }).message ??
        'Hemos enviado un enlace de acceso. Revisa tu correo para completar el inicio de sesion.';
      setMessage(successMessage);
      setMessageVariant('success');
    } catch (error) {
      setMessage('No pudimos conectar con el servidor.');
      setMessageVariant('error');
    } finally {
      setLoading(false);
    }
  }

  const messageClassName = messageVariant === 'error'
    ? 'message'
    : messageVariant === 'success'
      ? 'message message--success'
      : 'message message--info';

  return (
    <main className="section" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 160px)' }}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div>
          <span className="section-title">Bienvenido de regreso</span>
          <h1>Iniciar sesion</h1>
          <p className="link-muted" style={{ marginTop: 4 }}>
            Ingresa tu correo y enviaremos un enlace seguro que completara tu acceso.
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
        {message && <div className={messageClassName}>{message}</div>}
        <button type="submit" disabled={loading} className="button primary">
          {loading ? 'Enviando enlace...' : 'Solicitar enlace'}
        </button>
        <p>
          Aun no tienes cuenta? <Link href="/sign-up">Crear cuenta</Link>
        </p>
      </form>
    </main>
  );
}
