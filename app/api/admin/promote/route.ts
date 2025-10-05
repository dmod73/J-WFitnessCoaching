import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Servidor sin credenciales de Supabase' }, { status: 500 });
  }

  let body: { code?: string; email?: string };

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { code, email } = body;

  if (!code || !email) {
    return NextResponse.json({ error: 'Falta código o email' }, { status: 400 });
  }

  if (code !== process.env.ADMIN_INVITE_CODE) {
    return NextResponse.json({ error: 'Código inválido' }, { status: 403 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await adminClient.rpc('promote_to_admin', { target_email: email });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
