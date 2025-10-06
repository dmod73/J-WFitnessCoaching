import { NextResponse, type NextRequest } from 'next/server';
import { createClientServer } from '@/lib/supabase-server';

async function getActiveCartId(supabase: Awaited<ReturnType<typeof createClientServer>>, userId: string) {
  const result = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle<{ id: string }>();

  if (result.error && result.error.code !== 'PGRST116') {
    throw result.error;
  }

  return result.data?.id ?? null;
}

async function getOrCreateActiveCart(supabase: Awaited<ReturnType<typeof createClientServer>>, userId: string) {
  const existingId = await getActiveCartId(supabase, userId);

  if (existingId) {
    return existingId;
  }

  const inserted = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single<{ id: string }>();

  if (inserted.error) {
    throw inserted.error;
  }

  return inserted.data.id;
}

async function computeCartSummary(supabase: Awaited<ReturnType<typeof createClientServer>>, cartId: string) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('quantity, unit_price_cents')
    .eq('cart_id', cartId);

  if (error) {
    throw error;
  }

  const itemCount = data?.reduce((total, item) => total + (item.quantity ?? 0), 0) ?? 0;
  const totalCents = data?.reduce((total, item) => total + (item.quantity ?? 0) * (item.unit_price_cents ?? 0), 0) ?? 0;

  return { itemCount, totalCents };
}

export async function POST(request: NextRequest) {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesion para agregar cursos.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { courseId?: string; quantity?: number } | null;

  if (!body?.courseId) {
    return NextResponse.json({ error: 'courseId es requerido.' }, { status: 400 });
  }

  const quantity = Math.max(1, Math.floor(body.quantity ?? 1));

  const courseQuery = await supabase
    .from('courses')
    .select('id, is_active')
    .eq('id', body.courseId)
    .maybeSingle<{ id: string; is_active: boolean }>();

  if (!courseQuery.data || courseQuery.error || !courseQuery.data.is_active) {
    return NextResponse.json({ error: 'El curso no existe o no esta disponible.' }, { status: 404 });
  }

  const cartId = await getOrCreateActiveCart(supabase, user.id);

  const existingItem = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('course_id', body.courseId)
    .maybeSingle<{ id: string; quantity: number }>();

  if (existingItem.error && existingItem.error.code !== 'PGRST116') {
    return NextResponse.json({ error: existingItem.error.message }, { status: 400 });
  }

  let finalQuantity = quantity;

  if (existingItem.data?.id) {
    const newQuantity = (existingItem.data.quantity ?? 0) + quantity;
    finalQuantity = newQuantity;
    const update = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', existingItem.data.id);

    if (update.error) {
      return NextResponse.json({ error: update.error.message }, { status: 400 });
    }
  } else {
    const insert = await supabase
      .from('cart_items')
      .insert({ cart_id: cartId, course_id: body.courseId, quantity });

    if (insert.error) {
      return NextResponse.json({ error: insert.error.message }, { status: 400 });
    }
  }

  const summary = await computeCartSummary(supabase, cartId);

  return NextResponse.json({ cartId, itemCount: summary.itemCount, totalCents: summary.totalCents, quantity: finalQuantity });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesion.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { courseId?: string } | null;

  if (!body?.courseId) {
    return NextResponse.json({ error: 'courseId es requerido.' }, { status: 400 });
  }

  const cartId = await getActiveCartId(supabase, user.id);

  if (!cartId) {
    return NextResponse.json({ cartId: null, itemCount: 0, totalCents: 0 });
  }

  const deletion = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
    .eq('course_id', body.courseId);

  if (deletion.error) {
    return NextResponse.json({ error: deletion.error.message }, { status: 400 });
  }

  const summary = await computeCartSummary(supabase, cartId);

  return NextResponse.json({ cartId, itemCount: summary.itemCount, totalCents: summary.totalCents });
}
