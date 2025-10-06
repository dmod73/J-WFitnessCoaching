'use client';
import { useEffect, useState } from 'react';

const slides = [
  {
    title: 'Transformaciones reales',
    caption: 'Antes y despues de clientes que siguieron el plan Hybrid Strength por 6 meses.'
  },
  {
    title: 'Coaches en accion',
    caption: 'Entrenadores liderando sesiones de movilidad y fuerza tactica en el area metro.'
  },
  {
    title: 'Metodos premium',
    caption: 'Equipos, sensores y protocolos que usamos para medir tu progreso cada semana.'
  }
];

const intervalMs = 5000;

export function HeroSessionCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, []);

  const active = slides[index];

  return (
    <div className="hero-carousel">
      <div className="hero-slide-visual">
        <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={active.title}>
          <defs>
            <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7f56d9" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <rect x="10" y="20" width="180" height="110" rx="18" fill="url(#heroGradient)" opacity="0.75" />
          <rect x="24" y="34" width="60" height="78" rx="12" fill="#0c1019" opacity="0.6" />
          <rect x="94" y="34" width="82" height="48" rx="12" fill="#0c1019" opacity="0.6" />
          <rect x="94" y="90" width="82" height="22" rx="12" fill="#0c1019" opacity="0.6" />
          <circle cx="54" cy="112" r="18" fill="#f97316" opacity="0.8" />
          <path d="M46 80 L62 70 L78 90" stroke="#7f56d9" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.8" />
        </svg>
      </div>
      <div className="hero-slide-copy">
        <h3 style={{ margin: '0 0 8px' }}>{active.title}</h3>
        <p style={{ margin: 0 }}>{active.caption}</p>
      </div>
      <div className="hero-carousel-dots">
        {slides.map((_, i) => (
          <span key={i} className={`hero-dot ${i === index ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
}
