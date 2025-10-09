const SUPABASE_URL_DIRECT: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXPLICIT_APP_URL: string | undefined = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? process.env.VERCEL_URL;

function decodeBase64Url(segment: string): string {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  if (typeof globalThis.atob === 'function') {
    try {
      return decodeURIComponent(escape(globalThis.atob(padded)));
    } catch (error) {
      console.error('[supabase-env] Error al decodificar en el navegador:', error);
    }
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf8');
  }

  throw new Error('No existe mecanismo para decodificar base64url en este entorno');
}

function deriveUrlFromKey(key: string | undefined | null): string | null {
  if (!key) return null;
  const parts = key.split('.');
  if (parts.length < 2) return null;

  try {
    const payloadJson = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadJson) as { ref?: string };
    if (typeof payload.ref === 'string' && payload.ref.length > 0) {
      return `https://${payload.ref}.supabase.co`;
    }
  } catch (error) {
    console.error('[supabase-env] No se pudo derivar URL desde la key:', error);
  }

  return null;
}

export function resolveSupabaseUrl(): string {
  if (SUPABASE_URL_DIRECT && SUPABASE_URL_DIRECT.length > 0) {
    return SUPABASE_URL_DIRECT.replace(/\/*$/, '');
  }

  const derived = deriveUrlFromKey(SUPABASE_ANON_KEY ?? SUPABASE_SERVICE_ROLE_KEY ?? null);
  if (derived) return derived;

  throw new Error('No se pudo resolver la URL de Supabase. Define NEXT_PUBLIC_SUPABASE_URL o aporta una key valida.');
}

export function resolveAnonKey(): string {
  if (!SUPABASE_ANON_KEY) {
    throw new Error('Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.');
  }
  return SUPABASE_ANON_KEY;
}

export function resolveServiceRoleKey(): string {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor.');
  }
  return SUPABASE_SERVICE_ROLE_KEY;
}

export function resolveAppUrl(): string {
  if (EXPLICIT_APP_URL && EXPLICIT_APP_URL.length > 0) {
    const normalized = EXPLICIT_APP_URL.startsWith('http') ? EXPLICIT_APP_URL : `https://${EXPLICIT_APP_URL}`;
    return normalized.replace(/\/+$/, '');
  }

  return 'http://localhost:3000';
}
