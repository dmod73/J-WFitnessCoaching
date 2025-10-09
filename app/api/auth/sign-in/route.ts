import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { resolveAnonKey, resolveSupabaseUrl } from '@/lib/supabase-env';

const SUPABASE_URL = resolveSupabaseUrl();
const SUPABASE_ANON_KEY = resolveAnonKey();

export const runtime = 'nodejs';

function resolveRedirectBase(request: NextRequest): string {
  const refererHeader = request.headers.get('referer');
  if (refererHeader) {
    try {
      const refererUrl = new URL(refererHeader);
      return refererUrl.origin;
    } catch (error) {
      console.warn('[auth-sign-in] Referer invalido, se usara otro origen:', error instanceof Error ? error.message : error);
    }
  }

  const originHeader = request.headers.get('origin');
  if (originHeader) {
    return originHeader;
  }

  const hostHeader = request.headers.get('host');
  if (hostHeader) {
    const forwardedProto = request.headers.get('x-forwarded-proto');
    const protocol = forwardedProto && forwardedProto.length > 0 ? forwardedProto : request.nextUrl.protocol.replace(/:$/, '');
    return `${protocol}://${hostHeader}`;
  }

  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  let body: { email?: string } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Solicitud invalida.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: 'Email es obligatorio.' }, { status: 400 });
  }

  const response = NextResponse.json({
    ok: true,
    message: 'Te enviamos un enlace seguro. Revisa tu correo para completar el acceso.',
  });

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

  const redirectBase = resolveRedirectBase(request);
  const redirectUrl = new URL('/api/auth/callback', redirectBase);
  redirectUrl.searchParams.set('next', '/account');

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl.toString(),
      shouldCreateUser: false,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message ?? 'No pudimos enviar el enlace, intenta mas tarde.' }, { status: 400 });
  }

  console.log('[auth-sign-in] Magic link solicitado', { email, redirectTo: redirectUrl.toString() });

  return response;
}
