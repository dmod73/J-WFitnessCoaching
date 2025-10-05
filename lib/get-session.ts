import type { User } from '@supabase/supabase-js';
import { createClientServer } from './supabase-server';

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

  return { user, profile: profile ?? null };
}
