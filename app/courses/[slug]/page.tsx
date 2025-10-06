import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionWithProfile } from '@/lib/get-session';
import { createClientServer } from '@/lib/supabase-server';
import { hasCourseAccess } from '@/lib/course-access';
import { courseContentLibrary } from '@/lib/course-content';

export const dynamic = 'force-dynamic';

type CourseRecord = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

function LockedOverlay({ headline, copy }: { headline: string; copy: string }) {
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        padding: '60px 24px',
        background: 'rgba(12, 15, 21, 0.85)',
        textAlign: 'center',
        gap: 12,
      }}
    >
      <strong>{headline}</strong>
      <p className="link-muted" style={{ margin: 0 }}>
        {copy}
      </p>
    </div>
  );
}

function VideoSection({
  title,
  description,
  videoUrl,
  unlocked,
}: {
  title: string;
  description: string;
  videoUrl: string;
  unlocked: boolean;
}) {
  return (
    <section className="feature-card" style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <p className="link-muted" style={{ margin: 0 }}>{description}</p>
      </div>
      <div
        style={{
          position: 'relative',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(124, 136, 152, 0.25)'
        }}
      >
        {unlocked ? (
          <iframe
            title={title}
            src={videoUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', minHeight: 320, border: 'none' }}
          />
        ) : (
          <LockedOverlay
            headline="Contenido bloqueado"
            copy="Completa el pago para liberar este modulo. Cuando Stripe confirme tu orden enviaremos este video directo a tu bandeja."
          />
        )}
      </div>
    </section>
  );
}

export default async function CourseDeliveryPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClientServer();
  const { data: course, error } = await supabase
    .from('courses')
    .select('id, slug, name, description')
    .eq('slug', slug)
    .maybeSingle<CourseRecord>();

  if (error) {
    console.error('[course-page] Error obteniendo curso:', error.message);
  }

  if (!course) {
    notFound();
  }

  const content = courseContentLibrary[slug];
  const { user } = await getSessionWithProfile();
  const hasAccess = user ? await hasCourseAccess(user.id, course.id) : false;

  const heroMessage = !user
    ? 'Inicia sesion y confirma tu compra para acceder al contenido completo.'
    : hasAccess
      ? 'Gracias por tu compra. Disfruta el contenido exclusivo de este programa.'
      : 'Detectamos que aun no tienes acceso activo. Una vez Stripe confirme el pago, desbloquearemos automaticamente los videos.';

  return (
    <main className="section" style={{ display: 'grid', gap: 36 }}>
      <div className="container" style={{ display: 'grid', gap: 28, maxWidth: 860 }}>
        <header className="feature-card" style={{ display: 'grid', gap: 18 }}>
          <div style={{ display: 'grid', gap: 8 }}>
            <span className="section-title">Curso</span>
            <h1 style={{ margin: 0 }}>{course.name}</h1>
            {course.description && (
              <p className="link-muted" style={{ margin: 0 }}>{course.description}</p>
            )}
          </div>
          <p style={{ margin: 0 }}>{heroMessage}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {!user && (
              <>
                <Link className="button primary" href="/sign-in">
                  Iniciar sesion
                </Link>
                <Link className="button secondary" href="/sign-up">
                  Crear cuenta
                </Link>
              </>
            )}
            {user && !hasAccess && (
              <>
                <Link className="button primary" href="/#programas">
                  Elegir plan
                </Link>
                <Link className="button secondary" href="/cart">
                  Revisar carrito
                </Link>
              </>
            )}
          </div>
        </header>

        {content ? (
          <>
            <section className="feature-card" style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <h2 style={{ margin: 0 }}>Introduccion</h2>
                <p className="link-muted" style={{ margin: 0 }}>{content.intro.summary}</p>
              </div>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(124, 136, 152, 0.25)'
                }}
              >
                {hasAccess ? (
                  <iframe
                    title={`Intro ${course.name}`}
                    src={content.intro.videoUrl}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', minHeight: 360, border: 'none' }}
                  />
                ) : (
                  <LockedOverlay
                    headline="Vista previa bloqueada"
                    copy="Cuando finalicemos la integracion con Stripe, recibiras el acceso completo a este modulo introductorio."
                  />
                )}
              </div>
            </section>

            {content.modules.map((module) => (
              <VideoSection
                key={module.title}
                title={module.title}
                description={module.description}
                videoUrl={module.videoUrl}
                unlocked={hasAccess}
              />
            ))}

            {content.resources && content.resources.length > 0 && (
              <section className="feature-card" style={{ display: 'grid', gap: 12 }}>
                <h2 style={{ margin: 0 }}>Recursos complementarios</h2>
                <ul style={{ listStyle: 'disc', paddingLeft: 22, margin: 0, color: 'var(--color-muted)', display: 'grid', gap: 4 }}>
                  {content.resources.map((resource) => (
                    <li key={resource.href}>
                      <a className="link-muted" href={resource.href} target="_blank" rel="noopener noreferrer">
                        {resource.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <section className="feature-card" style={{ display: 'grid', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Contenido en preparacion</h2>
            <p className="link-muted" style={{ margin: 0 }}>
              Estamos alistando el contenido multimedia de este programa. Recibiras un correo en cuanto este disponible.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}