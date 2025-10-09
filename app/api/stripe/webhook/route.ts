import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getAdminClient } from '@/lib/supabase-admin';
import { sendCourseReceiptEmail } from '@/lib/emails/send-course-receipt';
const STRIPE_WEBHOOK_SECRET: string | undefined = process.env.STRIPE_WEBHOOK_SECRET;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  const cartId = session.metadata?.cart_id;
  const userId = session.metadata?.user_id ?? null;
  const admin = getAdminClient();

  if (!cartId) {
    console.warn('[stripe-webhook] Session sin cart_id', session.id);
    return;
  }

  const existingOrder = await admin
    .from('orders')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle<{ id: string }>();

  if (existingOrder.data?.id) {
    return;
  }

  const cartQuery = await admin
    .from('carts')
    .select('id, user_id, status')
    .eq('id', cartId)
    .maybeSingle<{ id: string; user_id: string | null; status: string }>();

  if (cartQuery.error || !cartQuery.data) {
    console.error('[stripe-webhook] Cart no encontrado', cartId, cartQuery.error?.message);
    return;
  }

  const itemsQuery = await admin
    .from('cart_items')
    .select(
      `
        quantity,
        unit_price_cents,
        unit_currency,
        course:courses(
          id,
          name,
          description,
          delivery_html_url,
          currency,
          price_cents,
          stripe_price_id
        )
      `
    )
    .eq('cart_id', cartId)
    .returns<Array<{
      quantity: number;
      unit_price_cents: number | null;
      unit_currency: string | null;
      course: {
        id: string;
        name: string;
        description: string | null;
        delivery_html_url: string | null;
        currency: string;
        price_cents: number;
        stripe_price_id: string | null;
      } | null;
    }>>();

  if (itemsQuery.error) {
    console.error('[stripe-webhook] No se pudieron obtener items:', itemsQuery.error.message);
    return;
  }

  const items = itemsQuery.data ?? [];
  if (!items.length) {
    console.warn('[stripe-webhook] Carrito sin items', cartId);
    return;
  }

  const email = session.customer_details?.email ?? session.customer_email;
  if (!email) {
    console.warn('[stripe-webhook] Session sin email', session.id);
    return;
  }

  const invoice = typeof session.invoice === 'string' ? null : session.invoice;
  const receiptUrl = invoice?.hosted_invoice_url ?? invoice?.invoice_pdf ?? null;

  const subtotalCents = items.reduce((acc, item) => acc + (item.quantity ?? 0) * (item.unit_price_cents ?? item.course?.price_cents ?? 0), 0);
  const totalCents = typeof session.amount_total === 'number' ? session.amount_total : subtotalCents;
  const discountCents = typeof session.total_details?.amount_discount === 'number' ? session.total_details.amount_discount : 0;
  const currency = session.currency?.toUpperCase() ?? items[0]?.unit_currency ?? items[0]?.course?.currency ?? 'USD';

  const orderInsert = await admin
    .from('orders')
    .insert({
      user_id: userId ?? cartQuery.data.user_id,
      email,
      status: 'paid',
      total_cents: totalCents,
      currency,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null,
      receipt_url: receiptUrl,
    })
    .select('id')
    .single<{ id: string }>();

  if (orderInsert.error || !orderInsert.data?.id) {
    console.error('[stripe-webhook] No se pudo crear la orden:', orderInsert.error?.message);
    return;
  }

  const orderId = orderInsert.data.id;

  const orderItems = items.map((item) => ({
    order_id: orderId,
    course_id: item.course!.id,
    quantity: item.quantity ?? 1,
    unit_price_cents: item.unit_price_cents ?? item.course!.price_cents,
    unit_currency: item.unit_currency ?? item.course!.currency,
    delivery_html_url: item.course!.delivery_html_url,
  }));

  const orderItemsInsert = await admin.from('order_items').insert(orderItems);

  if (orderItemsInsert.error) {
    console.error('[stripe-webhook] No se pudieron guardar los items de la orden:', orderItemsInsert.error.message);
  }

  await admin
    .from('carts')
    .update({ status: 'converted', stripe_checkout_session_id: session.id })
    .eq('id', cartId);

  await admin.from('cart_items').delete().eq('cart_id', cartId);

  try {
    await sendCourseReceiptEmail({
      to: email,
      orderId,
      buyerName: session.customer_details?.name ?? null,
      currency: { code: currency },
      items: items.map((item) => ({
        name: item.course?.name ?? 'Curso',
        description: item.course?.description ?? undefined,
        accessUrl: item.course?.delivery_html_url ?? '#',
        price: item.unit_price_cents ?? item.course?.price_cents ?? 0,
      })),
      subtotal: subtotalCents,
      discount: discountCents,
      total: totalCents,
      supportEmail: null,
    });
  } catch (error) {
    console.error('[stripe-webhook] No se pudo enviar el recibo:', error instanceof Error ? error.message : error);
  }
}

export async function POST(request: NextRequest) {
  const signatureHeader = request.headers.get('stripe-signature');

  if (!signatureHeader) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const payload = await request.text();
  const signature = signatureHeader ?? '';

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET no configurado');
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('[stripe-webhook] Error al verificar firma:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillCheckoutSession(session);
    }
  } catch (error) {
    console.error('[stripe-webhook] Error procesando evento:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}













