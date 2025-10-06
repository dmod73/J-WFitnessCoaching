import { createClient } from '@supabase/supabase-js';
import { resolveServiceRoleKey, resolveSupabaseUrl } from './supabase-env';

const adminClient = createClient(resolveSupabaseUrl(), resolveServiceRoleKey(), {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export function getAdminClient() {
  return adminClient;
}
