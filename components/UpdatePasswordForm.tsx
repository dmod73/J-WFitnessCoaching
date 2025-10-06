'use client';
import { useState, useTransition } from 'react';

export function UpdatePasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (password.length < 8) {
      setStatus('La nueva clave debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('Las claves no coinciden.');
      return;
    }

    startTransition(async () => {
      const response = await fetch('/api/account/update-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json().catch(() => null)) ?? {};

      if (!response.ok) {
        setStatus((payload as { error?: string }).error ?? 'No se pudo actualizar la clave.');
        return;
      }

      setStatus('Clave actualizada. Usa la nueva clave en tu siguiente ingreso.');
      setPassword('');
      setConfirmPassword('');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="input-field-group">
      <label className="input-label">
        Nueva clave
        <input
          className="input-field"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          placeholder="********"
          autoComplete="new-password"
        />
      </label>
      <label className="input-label">
        Confirma la clave
        <input
          className="input-field"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          placeholder="********"
          autoComplete="new-password"
        />
      </label>
      <button type="submit" disabled={isPending} className="button secondary">
        {isPending ? 'Guardando...' : 'Actualizar clave'}
      </button>
      {status && <p className="message" style={{ margin: 0 }}>{status}</p>}
    </form>
  );
}
