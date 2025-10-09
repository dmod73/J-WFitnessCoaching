import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSessionWithProfile } from '@/lib/get-session';
import { getCartWithItems } from '@/lib/cart';
import { resolveAppUrl } from '@/lib/supabase-env';
import { createClientServer } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const { user } = await getSessionWithProfile();

  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesion para procesar el pago.' }, { status: 401 });
  }

  const cart = await getCartWithItems(user.id);

  if (!cart.cartId || cart.items.length === 0) {
    return NextResponse.json({ error: 'Tu carrito esta vacio.' }, { status: 400 });
  }

  const missingPrice = cart.items.some((item) => !item.course?.stripe_price_id);

  if (missingPrice) {
    return NextResponse.json({ error: 'Uno de los cursos no tiene precio configurado en Stripe.' }, { status: 400 });
  }

  const appUrl = resolveAppUrl();
  const successUrl = new URL('/checkout/success', appUrl);
  successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
  const cancelUrl = new URL('/cart', appUrl);
  cancelUrl.searchParams.set('cancelled', '1');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    metadata: {
      cart_id: cart.cartId,
      user_id: user.id,
    },
    line_items: cart.items.map((item) => ({
      price: item.course!.stripe_price_id!,
      quantity: item.quantity ?? 1,
    })),
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
  });

  const supabase = await createClientServer();
  await supabase
    .from('carts')
    .update({ status: 'locked', stripe_checkout_session_id: session.id })
    .eq('id', cart.cartId);

  return NextResponse.json({ url: session.url });
}