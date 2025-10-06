'use client';
import { createBrowserClient } from '@supabase/ssr';
import { resolveAnonKey, resolveSupabaseUrl } from './supabase-env';

const SUPABASE_URL = resolveSupabaseUrl();
const SUPABASE_ANON_KEY = resolveAnonKey();

export function createClientBrowser() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
