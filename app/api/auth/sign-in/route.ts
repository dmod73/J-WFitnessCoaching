import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { resolveAnonKey, resolveSupabaseUrl } from '@/lib/supabase-env';

const SUPABASE_URL = resolveSupabaseUrl();
const SUPABASE_ANON_KEY = resolveAnonKey();

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

  const response = NextResponse.json({ ok: true });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return response;
}
