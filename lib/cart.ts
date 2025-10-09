import { createClientServer } from './supabase-server';

export type CartSummary = {
  cartId: string | null;
  itemCount: number;
  totalCents: number;
  currency: string | null;
};

export type CartItemWithCourse = {
  id: string;
  quantity: number;
  unit_price_cents: number;
  unit_currency: string | null;
  course: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    delivery_html_url: string | null;
    thumbnail_url: string | null;
    currency: string;
    price_cents: number;
    stripe_product_id: string | null;
    stripe_price_id: string | null;
  } | null;
};

export type CartDetail = CartSummary & {
  items: CartItemWithCourse[];
};

async function fetchActiveCartId(userId: string) {
  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('carts')
    .select('id, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle<{ id: string; status: string }>();

  if (error && error.code !== 'PGRST116') {
    console.error('[cart] Error al obtener carrito activo:', error.message);
    throw error;
  }

  return data?.id ?? null;
}

export async function getCartSummary(userId: string): Promise<CartSummary> {
  const cartId = await fetchActiveCartId(userId);

  if (!cartId) {
    return { cartId: null, itemCount: 0, totalCents: 0, currency: null };
  }

  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity, unit_price_cents, unit_currency')
    .eq('cart_id', cartId);

  if (error) {
    console.error('[cart] Error al obtener resumen de items:', error.message);
    throw error;
  }

  const itemCount = data?.reduce((total, item) => total + (item.quantity ?? 0), 0) ?? 0;
  const totalCents = data?.reduce((total, item) => total + (item.quantity ?? 0) * (item.unit_price_cents ?? 0), 0) ?? 0;
  const currency = data && data[0]?.unit_currency ? data[0].unit_currency : null;

  return { cartId, itemCount, totalCents, currency };
}

export async function getCartWithItems(userId: string): Promise<CartDetail> {
  const cartId = await fetchActiveCartId(userId);

  if (!cartId) {
    return { cartId: null, itemCount: 0, totalCents: 0, currency: null, items: [] };
  }

  const supabase = await createClientServer();
  const { data, error } = await supabase
    .from('cart_items')
    .select(
      `
        id,
        quantity,
        unit_price_cents,
        unit_currency,
        course:courses (
          id,
          slug,
          name,
          description,
          delivery_html_url,
          thumbnail_url,
          currency,
          price_cents,
          stripe_product_id,
          stripe_price_id
        )
      `
    )
    .eq('cart_id', cartId)
    .order('created_at', { ascending: true })
    .returns<CartItemWithCourse[]>();

  if (error) {
    console.error('[cart] Error al obtener items del carrito:', error.message);
    throw error;
  }

  const items = data ?? [];
  const itemCount = items.reduce((total, item) => total + (item.quantity ?? 0), 0);
  const totalCents = items.reduce((total, item) => total + (item.quantity ?? 0) * (item.unit_price_cents ?? 0), 0);
  const currency = items.length > 0 ? items[0]?.unit_currency ?? items[0]?.course?.currency ?? null : null;

  return { cartId, items, itemCount, totalCents, currency };
}


