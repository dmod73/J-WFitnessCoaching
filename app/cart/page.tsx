import Link from 'next/link';
import { StripeCheckoutButton } from '@/components/StripeCheckoutButton';
import { CartItemsList } from '@/components/CartItemsList';
import { getSessionWithProfile } from '@/lib/get-session';
import { getCartWithItems } from '@/lib/cart';

interface CartPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export const dynamic = 'force-dynamic';

function getFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function CartPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[]>> }) {
  const { user } = await getSessionWithProfile();
  const params = searchParams ? await searchParams : {};
  const cancelled = getFirstParam(params.cancelled) === '1';

  if (!user) {
    return (
      <main className="section" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
        <div className="feature-card cart-empty-card">
          <span className="section-title">Carrito</span>
          <h1 className="cart-heading">Tus cursos guardados</h1>
          <p className="link-muted" style={{ margin: 0 }}>
            Inicia sesion para ver los programas que agregaste y completar la compra.
          </p>
          <div className="button-row button-row--center">
            <Link className="button primary" href="/sign-in">
              Iniciar sesion
            </Link>
            <Link className="button secondary" href="/sign-up">
              Crear cuenta
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const cart = await getCartWithItems(user.id);

  if (!cart.items.length) {
    return (
      <main className="section" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
        <div className="feature-card cart-empty-card">
          <span className="section-title">Carrito</span>
          <h1 className="cart-heading">Tus cursos guardados</h1>
          <p className="link-muted" style={{ margin: 0 }}>
            Aun no agregaste programas. Cuando selecciones un plan lo veras aqui listo para completar el pago.
          </p>
          <div className="button-row button-row--center">
            <Link className="button primary" href="/#programas">
              Explorar programas
            </Link>
            <Link className="button secondary" href="/account">
              Volver a mi cuenta
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container cart-container">
        <div className="feature-card cart-intro">
          <span className="section-title">Carrito</span>
          <h1 className="cart-heading">Tus cursos guardados</h1>
          <p className="link-muted" style={{ margin: 0 }}>
            Confirma tu seleccion y completa el pago seguro con Stripe para recibir el acceso inmediato a tus cursos.
          </p>
        </div>

        <CartItemsList items={cart.items} currency={cart.currency} totalCents={cart.totalCents} />

        <div className="feature-card cart-summary" style={{ display: 'grid', gap: 16 }}>
          <h2 style={{ margin: 0 }}>Completar compra con Stripe</h2>
          <p className="link-muted" style={{ margin: 0 }}>
            Seras redirigido a Stripe para ingresar los datos de tu tarjeta. Al finalizar enviaremos un recibo con los enlaces HTML de los cursos.
          </p>
          <StripeCheckoutButton />
          {cancelled && (
            <p style={{ color: '#f87171', margin: 0 }}>
              El checkout fue cancelado. Puedes intentarlo nuevamente cuando estes listo.
            </p>
          )}
          <div className="button-row">
            <Link className="button secondary" href="/#programas">
              Seguir explorando cursos
            </Link>
            <Link className="button secondary" href="/account">
              Ver mi cuenta
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}



