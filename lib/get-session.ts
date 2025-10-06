import type { User } from '@supabase/supabase-js';
import { createClientServer } from './supabase-server';
import { getAdminClient } from './supabase-admin';

type Profile = {
  id: string;
  email: string | null;
  role: 'admin' | 'user';
};

type SessionResult = {
  user: User | null;
  profile: Profile | null;
};

export async function getSessionWithProfile(): Promise<SessionResult> {
  const supabase = await createClientServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id,email,role')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  if (profile) {
    return { user, profile };
  }

  // Fallback con Service Role (por ejemplo, justo despu?s de promocionar un admin)
  const adminClient = getAdminClient();
  const { data: adminProfile, error: adminError } = await adminClient
    .from('profiles')
    .select('id,email,role')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  if (adminError) {
    console.error('[getSessionWithProfile] Fallback con service role fall?:', adminError.message);
  }

  return { user, profile: adminProfile ?? null };
}
