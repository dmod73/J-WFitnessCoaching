'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/format-currency';
import type { CartItemWithCourse } from '@/lib/cart';

interface CartItemsListProps {
  items: CartItemWithCourse[];
  currency: string | null;
  totalCents: number;
}

function formatCurrencyFromCents(valueInCents: number, currency = 'USD') {
  return formatCurrency({ value: (valueInCents ?? 0) / 100, currency });
}

export function CartItemsList({ items, currency, totalCents }: CartItemsListProps) {
  const router = useRouter();
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const resolvedCurrency = currency ?? 'USD';

  async function handleRemove(courseId: string | null | undefined) {
    if (!courseId) {
      setErrorMessage('Curso no valido.');
      return;
    }

    setPendingCourseId(courseId);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/cart/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'No se pudo eliminar el curso.');
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar el carrito.');
    } finally {
      setPendingCourseId(null);
    }
  }

  function renderPreviewLink(courseUrl: string | null | undefined, label: string) {
    if (!courseUrl) {
      return null;
    }

    if (courseUrl.startsWith('/')) {
      return (
        <Link className="button secondary" href={courseUrl}>
          {label}
        </Link>
      );
    }

    return (
      <a className="button secondary" href={courseUrl} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }

  return (
    <div className="feature-card" style={{ display: 'grid', gap: 18 }}>
      {items.map((item) => {
        const course = item.course;
        const pricePerUnit = formatCurrencyFromCents(item.unit_price_cents ?? course?.price_cents ?? 0, resolvedCurrency);
        const lineTotal = formatCurrencyFromCents((item.quantity ?? 0) * (item.unit_price_cents ?? course?.price_cents ?? 0), resolvedCurrency);
        const previewLabel = course?.delivery_html_url?.startsWith('/')
          ? 'Abrir contenido (acceso restringido)'
          : 'Ver vista previa';

        return (
          <article
            key={item.id}
            style={{
              display: 'grid',
              gap: 12,
              borderBottom: '1px solid rgba(124, 136, 152, 0.2)',
              paddingBottom: 18,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0 }}>{course?.name ?? 'Curso sin nombre'}</h3>
                <p className="link-muted" style={{ margin: '4px 0 0' }}>{course?.description ?? 'Detalles del curso disponibles tras la compra.'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong>{lineTotal}</strong>
                <p className="link-muted" style={{ margin: '4px 0 0' }}>
                  {item.quantity} x {pricePerUnit}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              {renderPreviewLink(course?.delivery_html_url ?? null, previewLabel)}
              <button
                type="button"
                className="button secondary"
                style={{ borderStyle: 'dashed' }}
                onClick={() => handleRemove(course?.id)}
                disabled={pendingCourseId === course?.id}
              >
                {pendingCourseId === course?.id ? 'Quitando...' : 'Eliminar'}
              </button>
            </div>
          </article>
        );
      })}

      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Total estimado</span>
          <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {formatCurrencyFromCents(totalCents, resolvedCurrency)}
          </span>
        </div>
        <p className="link-muted" style={{ margin: 0 }}>
          El pago se completara con Stripe en la siguiente fase. Tu recibo y acceso HTML quedaran listos automaticamente.
        </p>
        {errorMessage && (
          <p style={{ color: '#f87171', margin: '4px 0 0' }}>{errorMessage}</p>
        )}
      </div>
    </div>
  );
}

