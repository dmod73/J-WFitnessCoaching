import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { resolveAnonKey, resolveSupabaseUrl } from './supabase-env';

const SUPABASE_URL = resolveSupabaseUrl();
const SUPABASE_ANON_KEY = resolveAnonKey();

export async function createClientServer() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // Los componentes server solo necesitan lectura de cookies.
      },
      remove() {
        // Los componentes server solo necesitan lectura de cookies.
      },
    },
  });
}
