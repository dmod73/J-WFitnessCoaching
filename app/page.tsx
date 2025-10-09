import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { HeroSessionCarousel } from '@/components/HeroSessionCarousel';
import { CourseCatalog, type CourseCatalogItem } from '@/components/CourseCatalog';
import { createClientServer } from '@/lib/supabase-server';
import { getSessionWithProfile } from '@/lib/get-session';


type SearchParamsRecord = Record<string, string | string[] | undefined>

function resolveRedirectBase(searchParams?: SearchParamsRecord): string | null {
  const pickFirst = (value?: string | string[]): string | null => {
    if (!value) return null;
    return Array.isArray(value) ? value[0] ?? null : value;
  };

  return pickFirst(searchParams?.redirect_base);
}

function resolveNextTarget(searchParams?: SearchParamsRecord): string {
  const pickFirst = (value?: string | string[]): string | null => {
    if (!value) return null;
    return Array.isArray(value) ? value[0] ?? null : value;
  };

  const directNext = pickFirst(searchParams?.next);
  if (directNext) {
    return directNext;
  }

  const redirectToParam = pickFirst(searchParams?.redirect_to);
  if (!redirectToParam) {
    return '/account';
  }

  try {
    const redirectUrl = new URL(redirectToParam);
    const nestedNext = redirectUrl.searchParams.get('next');
    if (nestedNext) {
      return nestedNext;
    }

    const composedPath = `${redirectUrl.pathname}${redirectUrl.search}`;
    return composedPath === '' ? '/account' : composedPath;
  } catch (error) {
    console.error('[home] No pudimos interpretar redirect_to:', error instanceof Error ? error.message : error);
    return '/account';
  }
}

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

async function getActiveCourses(): Promise<CourseCatalogItem[]> {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('courses')
    .select('id, slug, name, description, price_cents, currency, delivery_html_url, thumbnail_url')
    .eq('is_active', true)
    .order('price_cents', { ascending: true });

  if (error) {
    console.error('[home] Error al cargar cursos:', error.message);
    return [];
  }

  return data ?? [];
}

export default async function Page({ searchParams }: { searchParams?: Promise<SearchParamsRecord> }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawCode = resolvedSearchParams.code;
  const codeParam = typeof rawCode === 'string' ? rawCode : Array.isArray(rawCode) ? rawCode[0] ?? null : null;
  const redirectBase = resolveRedirectBase(resolvedSearchParams);
  const headerList = await headers();
  const protocol = headerList.get('x-forwarded-proto') ?? 'http';
  const host = headerList.get('host') ?? 'localhost';
  const currentOrigin = `${protocol}://${host}`;

  if (codeParam) {
    const nextTarget = resolveNextTarget(resolvedSearchParams);
    const redirectParams = new URLSearchParams({ code: codeParam, next: nextTarget });
    const redirectQuery = redirectParams.toString();

    if (redirectBase && redirectBase.length > 0 && redirectBase !== currentOrigin) {
      redirect(`${redirectBase}/api/auth/callback?${redirectQuery}`);
    }

    redirect(`/api/auth/callback?${redirectQuery}`);
  }

  const [courses, sessionResult] = await Promise.all([getActiveCourses(), getSessionWithProfile()]);
  const isAuthenticated = Boolean(sessionResult.user);

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
            <p style={{ color: 'var(--color-muted)', maxWidth: 720, margin: '0 auto', lineHeight: 1.6 }}>
              Agrega tus cursos al carrito y en la siguiente etapa conectaremos Stripe para enviar automaticamente el recibo
              con el enlace HTML personalizado.
            </p>
          </div>
          <CourseCatalog courses={courses} isAuthenticated={isAuthenticated} />
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
