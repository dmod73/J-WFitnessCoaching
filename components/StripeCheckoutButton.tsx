'use client';

import { useState } from 'react';

interface StripeCheckoutButtonProps {
  className?: string;
  label?: string;
}

export function StripeCheckoutButton({ className, label = 'Finalizar compra con Stripe' }: StripeCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/session', { method: 'POST' });
      const payload = (await response.json().catch(() => null)) ?? {};

      if (!response.ok || !(payload as { url?: string }).url) {
        setError((payload as { error?: string }).error ?? 'No pudimos iniciar el checkout.');
        return;
      }

      window.location.href = (payload as { url: string }).url;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No pudimos iniciar el checkout.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <button
        type="button"
        className={className ?? 'button primary'}
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading ? 'Redirigiendo a Stripe...' : label}
      </button>
      {error && <p style={{ color: '#f87171', margin: 0 }}>{error}</p>}
    </div>
  );
}