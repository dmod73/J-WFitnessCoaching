import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { resolveAnonKey, resolveSupabaseUrl } from '@/lib/supabase-env';

const SUPABASE_URL = resolveSupabaseUrl();
const SUPABASE_ANON_KEY = resolveAnonKey();

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/account';
  const nextUrl = new URL(next, requestUrl.origin);

  const response = NextResponse.redirect(nextUrl);

  if (!code) {
    return response;
  }

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

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[auth/callback] No se pudo intercambiar el codigo por sesion:', error.message);
    const fallback = new URL('/sign-in', requestUrl.origin);
    fallback.searchParams.set('error', 'verification_failed');
    return NextResponse.redirect(fallback);
  }

  return response;
}
