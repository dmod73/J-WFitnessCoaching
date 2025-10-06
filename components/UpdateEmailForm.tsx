'use client';
import { useState, useTransition } from 'react';

interface UpdateEmailFormProps {
  initialEmail: string;
}

export function UpdateEmailForm({ initialEmail }: UpdateEmailFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    startTransition(async () => {
      const response = await fetch('/api/account/update-email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json().catch(() => null)) ?? {};

      if (!response.ok) {
        setStatus((payload as { error?: string }).error ?? 'No se pudo actualizar el email.');
        return;
      }

      setStatus('Email actualizado. Revisa tu bandeja para confirmar cambios.');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="input-field-group">
      <label className="input-label">
        Email principal
        <input
          className="input-field"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          placeholder="correo@ejemplo.com"
          autoComplete="email"
        />
      </label>
      <button type="submit" disabled={isPending} className="button primary">
        {isPending ? 'Guardando...' : 'Actualizar email'}
      </button>
      {status && <p className="message" style={{ margin: 0 }}>{status}</p>}
    </form>
  );
}
