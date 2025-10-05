'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientBrowser } from '@/lib/supabase-browser';

export default function SignUpPage() {
  const supabase = createClientBrowser();
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
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.session) {
      router.replace('/account');
      router.refresh();
      return;
    }

    setMessage('Registro iniciado. Revisa tu correo para confirmar la cuenta.');
  }

  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: 24 }}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, minWidth: 320 }}>
        <h1>Crear cuenta</h1>
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
        <label style={{ display: 'grid', gap: 4 }}>
          <span>Confirmar contraseña</span>
          <input
            placeholder='••••••••'
            type='password'
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </label>
        <button type='submit' disabled={loading}>
          {loading ? 'Registrando…' : 'Registrarme'}
        </button>
        {message && <p>{message}</p>}
        <p>
          ¿Ya tienes cuenta? <Link href='/sign-in'>Inicia sesión</Link>
        </p>
      </form>
    </main>
  );
}
