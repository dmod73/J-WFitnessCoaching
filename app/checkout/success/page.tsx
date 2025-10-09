import Link from 'next/link';

interface SuccessPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

function getFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function CheckoutSuccessPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[]>> }) {
  const params = searchParams ? await searchParams : {};
  const sessionId = getFirstParam(params.session_id);

  return (
    <main className="section" style={{ minHeight: 'calc(100vh - 200px)', display: 'grid', placeItems: 'center' }}>
      <div className="feature-card" style={{ maxWidth: 520, textAlign: 'center', display: 'grid', gap: 16 }}>
        <span className="section-title">Pago confirmado</span>
        <h1 style={{ margin: 0 }}>Gracias por tu compra</h1>
        <p className="link-muted" style={{ margin: 0 }}>
          Estamos preparando tu recibo y activando los accesos a los cursos. En breve recibirás un correo con todos los detalles.
        </p>
        {sessionId && (
          <p className="link-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Referencia de Stripe: <code>{sessionId}</code>
          </p>
        )}
        <div className="button-row button-row--center">
          <Link className="button primary" href="/account">
            Ir a mi cuenta
          </Link>
          <Link className="button secondary" href="/">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

