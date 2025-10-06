import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithProfile } from '@/lib/get-session';
import { getAdminClient } from '@/lib/supabase-admin';

export const runtime = 'nodejs';

function ensureAdmin(profileRole?: string | null) {
  if (profileRole !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const { user, profile } = await getSessionWithProfile();
  if (!user) {
    return NextResponse.json({ error: 'Sesion no valida.' }, { status: 401 });
  }
  const guard = ensureAdmin(profile?.role);
  if (guard) return guard;

  const adminClient = getAdminClient();
  const { data, error } = await adminClient
    .from('profiles')
    .select('id,email,role,created_at')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ users: data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const { user, profile } = await getSessionWithProfile();
  if (!user) {
    return NextResponse.json({ error: 'Sesion no valida.' }, { status: 401 });
  }
  const guard = ensureAdmin(profile?.role);
  if (guard) return guard;

  const body = await request.json().catch(() => null) as { userId?: string; role?: 'admin' | 'user' } | null;
  const targetId = body?.userId;
  const role = body?.role;

  if (!targetId || (role !== 'admin' && role !== 'user')) {
    return NextResponse.json({ error: 'Datos invalidos.' }, { status: 400 });
  }

  const adminClient = getAdminClient();
  const { data, error } = await adminClient
    .from('profiles')
    .update({ role })
    .eq('id', targetId)
    .select('id,email,role')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: data });
}

export async function DELETE(request: NextRequest) {
  const { user, profile } = await getSessionWithProfile();
  if (!user) {
    return NextResponse.json({ error: 'Sesion no valida.' }, { status: 401 });
  }
  const guard = ensureAdmin(profile?.role);
  if (guard) return guard;

  const body = await request.json().catch(() => null) as { userId?: string } | null;
  const targetId = body?.userId;

  if (!targetId) {
    return NextResponse.json({ error: 'Usuario requerido.' }, { status: 400 });
  }

  if (targetId === user.id) {
    return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta.' }, { status: 400 });
  }

  const adminClient = getAdminClient();
  await adminClient.from('profiles').delete().eq('id', targetId);
  await adminClient.auth.admin.deleteUser(targetId);

  return NextResponse.json({ ok: true });
}
