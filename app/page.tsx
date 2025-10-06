import Link from 'next/link';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { HeroSessionCarousel } from '@/components/HeroSessionCarousel';

const features = [
  {
    title: 'Coaching personalizado',
    copy: 'Planes hechos a medida para tus metas y estilo de vida con resultados sostenibles.'
  },
  {
    title: 'Seguimiento inteligente',
    copy: 'Reportes semanales, metricas integradas y ajustes tacticos para progresar sin pausa.'
  },
  {
    title: 'Comunidad y apoyo',
    copy: 'Sesiones en vivo, foros privados y feedback continuo para mantener la disciplina.'
  }
];

const tiers = [
  {
    title: 'Starter',
    price: 'USD 129',
    description: 'Ideal para retomar habitos desde casa o el gym.',
    items: ['Plan de entrenamiento mensual', 'Guia de alimentacion flexible', 'Feedback quincenal por chat']
  },
  {
    title: 'Elite',
    price: 'USD 249',
    description: 'Coaching premium con metricas avanzadas y contacto prioritario.',
    highlighted: true,
    items: ['Plan actualizado cada 2 semanas', 'Chequeos semanales 1:1', 'Integracion con wearables']
  },
  {
    title: 'Team',
    price: 'USD 399',
    description: 'Pensado para parejas o grupos pequenos que buscan accountability conjunta.',
    items: ['Rutinas sincronizadas', 'Retos mensuales exclusivos', 'Acceso a workshops privados']
  }
];

export default function Page() {
  return (
    <main>
      <section className="section" style={{ paddingTop: 120 }}>
        <div className="container" style={{ display: 'grid', gap: 36 }}>
          <div
            style={{
              display: 'grid',
              gap: 32,
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'grid', gap: 24 }}>
              <div>
                <span className="section-title">Entrena como atleta, vive como lider</span>
                <h1 className="hero-title">Coaching fitness integral para resultados que perduran</h1>
                <p className="hero-copy">
                  Entrenamientos periodizados, nutricion estrategica y mentalidad fuerte. Transformamos cuerpo, energia y
                  disciplina con herramientas guiadas por coaches certificados.
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <Link className="button primary" href="/sign-up">
                  Reservar onboarding gratuito
                </Link>
                <Link className="button secondary" href="#programas">
                  Ver programas
                </Link>
                <Link className="button secondary" href="/imc">
                  Calcular IMC
                </Link>
              </div>
            </div>
            <HeroSessionCarousel />
          </div>
          <div className="card-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="programas" className="section alt">
        <div className="container" style={{ display: 'grid', gap: 32 }}>
          <div style={{ textAlign: 'center' }}>
            <span className="section-title">Programas escalables</span>
            <h2 style={{ margin: '12px 0 0', fontSize: '2.2rem' }}>Elige la experiencia que potencia tu rendimiento</h2>
            <p style={{ color: 'var(--color-muted)', maxWidth: 720, margin: '12px auto 0', lineHeight: 1.7 }}>
              Cada plan incluye app movil, biblioteca de movimiento y comunidad privada. Mejora la fuerza, la
              recomposicion corporal y consolida habitos que lideran tu vida.
            </p>
          </div>
          <div className="card-grid">
            {tiers.map((tier) => (
              <article
                key={tier.title}
                className="feature-card"
                style={{
                  borderColor: tier.highlighted ? 'rgba(127, 86, 217, 0.6)' : undefined,
                  boxShadow: tier.highlighted ? '0 22px 45px rgba(127, 86, 217, 0.22)' : undefined,
                }}
              >
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h3 style={{ margin: 0 }}>{tier.title}</h3>
                    <span style={{ fontWeight: 600 }}>{tier.price}</span>
                  </div>
                  <p style={{ color: 'var(--color-muted)', margin: 0 }}>{tier.description}</p>
                  <ul style={{ paddingLeft: 20, margin: '10px 0 20px', color: 'var(--color-muted)', lineHeight: 1.6 }}>
                    {tier.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <Link className="button primary" href="/sign-up">
                  Aplicar ahora
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'grid', gap: 36 }}>
          <ReviewsCarousel />
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ display: 'grid', gap: 32, textAlign: 'center' }}>
          <span className="section-title">Testimonios en movimiento</span>
          <h2 style={{ margin: '0 auto', maxWidth: 680, fontSize: '2rem' }}>
            Duplicamos la energia del equipo y mejoramos la salud en solo 90 dias con el acompanamiento de J-W.
          </h2>
          <p style={{ color: 'var(--color-muted)', maxWidth: 640, margin: '0 auto', lineHeight: 1.7 }}>
            Metodologia orientada a resultados, seguimiento puntual y liderazgo positivo. Nuestro enfoque premium te
            acompana en cada repeticion, comida y descanso.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link className="button primary" href="/sign-up">
              Quiero mi plan personalizado
            </Link>
            <Link className="button secondary" href="mailto:coach@jwfitness.co">
              Hablar con un coach
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
