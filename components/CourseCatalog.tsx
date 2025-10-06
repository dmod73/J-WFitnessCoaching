'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type CourseCatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: string;
  delivery_html_url: string | null;
  thumbnail_url: string | null;
};

interface CourseCatalogProps {
  courses: CourseCatalogItem[];
  isAuthenticated: boolean;
}

function formatPrice(valueInCents: number, currency = 'USD') {
  const formatter = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  });

  return formatter.format((valueInCents ?? 0) / 100);
}

export function CourseCatalog({ courses, isAuthenticated }: CourseCatalogProps) {
  const router = useRouter();
  const [statusMap, setStatusMap] = useState<Record<string, 'idle' | 'loading' | 'added' | 'error'>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string | null>>({});

  async function handleAddToCart(courseId: string) {
    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }

    setStatusMap((prev) => ({ ...prev, [courseId]: 'loading' }));
    setErrorMap((prev) => ({ ...prev, [courseId]: null }));

    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? 'No se pudo agregar el curso.');
      }

      setStatusMap((prev) => ({ ...prev, [courseId]: 'added' }));
      router.refresh();
      setTimeout(() => {
        setStatusMap((prev) => ({ ...prev, [courseId]: 'idle' }));
      }, 2000);
    } catch (error) {
      setStatusMap((prev) => ({ ...prev, [courseId]: 'error' }));
      setErrorMap((prev) => ({ ...prev, [courseId]: error instanceof Error ? error.message : 'No se pudo agregar el curso.' }));
    }
  }

  if (!courses.length) {
    return (
      <div className="feature-card" style={{ textAlign: 'center', display: 'grid', gap: 12 }}>
        <h3>Catalogo en preparacion</h3>
        <p className="link-muted" style={{ margin: 0 }}>
          Aun no cargamos los cursos. Vuelve pronto o registrate para recibir actualizaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="card-grid">
      {courses.map((course, index) => {
        const status = statusMap[course.id] ?? 'idle';
        const isHighlighted = index === 1 && courses.length > 1;
        const buttonLabel = {
          idle: 'Agregar al carrito',
          loading: 'Agregando...',
          added: 'Agregado!',
          error: 'Reintentar',
        }[status];

        return (
          <article
            key={course.id}
            className="feature-card"
            style={{
              borderColor: isHighlighted ? 'rgba(127, 86, 217, 0.6)' : undefined,
              boxShadow: isHighlighted ? '0 22px 45px rgba(127, 86, 217, 0.22)' : undefined,
              display: 'grid',
              gap: 16,
            }}
          >
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ margin: 0 }}>{course.name}</h3>
                <span style={{ fontWeight: 600 }}>{formatPrice(course.price_cents, course.currency)}</span>
              </div>
              <p style={{ color: 'var(--color-muted)', margin: 0 }}>{course.description ?? 'Descripcion disponible al momento de publicar el curso.'}</p>
              {course.delivery_html_url && (
                <a className="link-muted" href={course.delivery_html_url} target="_blank" rel="noopener noreferrer">
                  Ver temario de muestra
                </a>
              )}
            </div>
            <button
              type="button"
              className="button primary"
              onClick={() => handleAddToCart(course.id)}
              disabled={status === 'loading'}
            >
              {buttonLabel}
            </button>
            {status === 'error' && errorMap[course.id] && (
              <p style={{ color: '#f87171', margin: 0 }}>{errorMap[course.id]}</p>
            )}
            {status === 'added' && (
              <p style={{ color: '#34d399', margin: 0 }}>Curso guardado. Revise el carrito para finalizar el pago.</p>
            )}
          </article>
        );
      })}
    </div>
  );
}
