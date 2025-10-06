import Link from 'next/link';
import { getSessionWithProfile } from '@/lib/get-session';
import { getCartWithItems } from '@/lib/cart';
import { CartItemsList } from '@/components/CartItemsList';

export const dynamic = 'force-dynamic';

export default async function CartPage() {
  const { user } = await getSessionWithProfile();

  if (!user) {
    return (
      <main className="section" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
        <div className="feature-card" style={{ width: 'min(520px, 100%)', textAlign: 'center', display: 'grid', gap: 18 }}>
          <span className="section-title">Carrito</span>
          <h1 style={{ margin: 0 }}>Tus cursos guardados</h1>
          <p className="link-muted" style={{ margin: 0 }}>
            Inicia sesion para ver los programas que agregaste y completar la compra.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
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
        <div className="feature-card" style={{ width: 'min(520px, 100%)', display: 'grid', gap: 18 }}>
          <span className="section-title">Carrito</span>
          <h1 style={{ margin: 0 }}>Tus cursos guardados</h1>
          <p className="link-muted" style={{ margin: 0 }}>
            Aun no agregaste programas. Cuando selecciones un plan lo veras aqui listo para completar el pago.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
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
    <main className="section" style={{ display: 'grid', gap: 36 }}>
      <div className="container" style={{ display: 'grid', gap: 24, maxWidth: 720 }}>
        <div className="feature-card" style={{ display: 'grid', gap: 12 }}>
          <span className="section-title">Carrito</span>
          <h1 style={{ margin: 0 }}>Tus cursos guardados</h1>
          <p className="link-muted" style={{ margin: 0 }}>
            Confirma tu seleccion y en la siguiente fase conectaremos Stripe para procesar el pago en linea.
          </p>
        </div>

        <CartItemsList items={cart.items} currency={cart.currency} totalCents={cart.totalCents} />

        <div className="feature-card" style={{ display: 'grid', gap: 12 }}>
          <h2 style={{ margin: 0 }}>Checkout con Stripe (proximamente)</h2>
          <p className="link-muted" style={{ margin: 0 }}>
            Estamos preparando la integracion para que puedas pagar con tarjeta y recibir automaticamente tu recibo con el link HTML del curso.
          </p>
          <button className="button primary" type="button" disabled style={{ opacity: 0.6 }}>
            Finalizar compra con Stripe
          </button>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
