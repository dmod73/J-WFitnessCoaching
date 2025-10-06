import type { AuthError, User } from '@supabase/supabase-js';
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

function isMissingRefreshToken(error: AuthError | null): boolean {
  if (!error) {
    return false;
  }

  return error.code === 'refresh_token_not_found' || error.message.includes('Refresh Token Not Found');
}

async function getAuthenticatedUser() {
  const supabase = await createClientServer();

  const {
    data: sessionData,
    error: sessionError,
  } = await supabase.auth.getSession();

  if (isMissingRefreshToken(sessionError)) {
    return { supabase, user: null } as const;
  }

  if (sessionError) {
    console.error('[getSessionWithProfile] Error obteniendo sesion:', sessionError.message);
    return { supabase, user: null } as const;
  }

  if (!sessionData?.session) {
    return { supabase, user: null } as const;
  }

  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (isMissingRefreshToken(userError)) {
    return { supabase, user: null } as const;
  }

  if (userError) {
    console.error('[getSessionWithProfile] Error autenticando usuario:', userError.message);
    return { supabase, user: null } as const;
  }

  return { supabase, user: userData.user } as const;
}

export async function getSessionWithProfile(): Promise<SessionResult> {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id,email,role')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  if (!error && profile) {
    return { user, profile };
  }

  if (error) {
    console.error('[getSessionWithProfile] Error consultando perfil con cookies:', error.message);
  }

  const adminClient = getAdminClient();
  const { data: adminProfile, error: adminError } = await adminClient
    .from('profiles')
    .select('id,email,role')
    .eq('id', user.id)
    .maybeSingle<Profile>();

  if (adminError) {
    console.error('[getSessionWithProfile] Fallback con service role fallo:', adminError.message);
  }

  return { user, profile: adminProfile ?? null };
}