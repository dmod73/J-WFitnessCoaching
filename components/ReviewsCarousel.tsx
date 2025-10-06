'use client';
import { useEffect, useState } from 'react';

const reviews = [
  {
    name: 'Valeria M.',
    location: 'Santurce, Puerto Rico',
    quote:
      'El coaching integro fuerza, nutricion y descanso. Baje 6% de grasa y ahora lidero con mas energia al equipo.'
  },
  {
    name: 'Rafael C.',
    location: 'Bayamon, Puerto Rico',
    quote:
      'Pasamos de rutinas improvisadas a un plan tactico. Mis marcadores de salud estan en verde y me siento invencible.'
  },
  {
    name: 'Isabela R.',
    location: 'Guaynabo, Puerto Rico',
    quote:
      'La guia semanal y los metodos de recuperacion evitaron lesiones. Mi equipo nota la diferencia en foco y animo.'
  },
  {
    name: 'Carlos J.',
    location: 'Hato Rey, Puerto Rico',
    quote:
      'Subi fuerza en todos los levantamientos y logre balancear viajes y entrenamiento gracias al seguimiento premium.'
  }
];

const intervalMs = 6000;

export function ReviewsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % reviews.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, []);

  const activeReview = reviews[index];

  return (
    <div className="feature-card" id="reviews" style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="section-title">Historias reales</span>
          <h2 style={{ margin: '10px 0 0', fontSize: '1.8rem' }}>Lideres del area metro confiando en J-W</h2>
        </div>
        <div className="star-rating">
          {Array.from({ length: 5 }).map((_, idx) => (
            <span className="star-icon" key={idx} />
          ))}
        </div>
      </div>
      <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-text)', margin: 0 }}>{activeReview.quote}</p>
      <div style={{ display: 'grid', gap: 4 }}>
        <strong>{activeReview.name}</strong>
        <span className="link-muted">{activeReview.location}</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {reviews.map((_, reviewIndex) => (
          <span
            key={reviewIndex}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: reviewIndex === index ? 'var(--color-primary)' : 'rgba(126, 140, 162, 0.35)',
              transition: 'background 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
}
