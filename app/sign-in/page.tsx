'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientBrowser } from '@/lib/supabase-browser';

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClientBrowser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Sesión iniciada, redirigiendo…');
    router.replace('/account');
    router.refresh();
  }

  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: 24 }}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, minWidth: 320 }}>
        <h1>Iniciar sesión</h1>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Email</span>
          <input
            placeholder='correo@ejemplo.com'
            type='email'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Contraseña</span>
          <input
            placeholder='••••••••'
            type='password'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type='submit' disabled={loading}>
          {loading ? 'Ingresando…' : 'Entrar'}
        </button>
        {message && <p>{message}</p>}
      </form>
    </main>
  );
}
