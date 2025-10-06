import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { resolveAnonKey, resolveSupabaseUrl } from '@/lib/supabase-env';
import { getSessionWithProfile } from '@/lib/get-session';

const SUPABASE_URL = resolveSupabaseUrl();
const SUPABASE_ANON_KEY = resolveAnonKey();

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest) {
  const { user } = await getSessionWithProfile();
  if (!user) {
    return NextResponse.json({ error: 'Sesion no valida.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { password?: string } | null;
  const newPassword = body?.password ?? '';

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'La clave debe tener al menos 8 caracteres.' }, { status: 400 });
  }

  const cookieUpdates: Array<{ name: string; value: string; options: CookieOptions }> = [];
  const cookieRemovals: Array<{ name: string; options: CookieOptions }> = [];

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieUpdates.push({ name, value, options });
      },
      remove(name: string, options: CookieOptions) {
        cookieRemovals.push({ name, options });
      },
    },
  });

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  cookieUpdates.forEach(({ name, value, options }) => response.cookies.set({ name, value, ...options }));
  cookieRemovals.forEach(({ name, options }) => response.cookies.set({ name, value: '', ...options }));

  return response;
}
