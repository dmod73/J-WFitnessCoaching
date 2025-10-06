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
            Confirma tu seleccion y en la siguiente fase conectaremos Stripe para procesar el pago en linea.
          </p>
        </div>

        <CartItemsList items={cart.items} currency={cart.currency} totalCents={cart.totalCents} />

        <div className="feature-card cart-summary">
          <h2 style={{ margin: 0 }}>Checkout con Stripe (proximamente)</h2>
          <p className="link-muted" style={{ margin: 0 }}>
            Estamos preparando la integracion para que puedas pagar con tarjeta y recibir automaticamente tu recibo con el link HTML del curso.
          </p>
          <button className="button primary" type="button" disabled style={{ opacity: 0.6 }}>
            Finalizar compra con Stripe
          </button>
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
