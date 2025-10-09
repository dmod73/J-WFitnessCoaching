import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveServiceRoleKey, resolveSupabaseUrl } from '@/lib/supabase-env';

const SUPABASE_URL = resolveSupabaseUrl();
const SUPABASE_SERVICE_ROLE_KEY = resolveServiceRoleKey();

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Solicitud invalida.' }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contrasena son obligatorios.' }, { status: 400 });
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
