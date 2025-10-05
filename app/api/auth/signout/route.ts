import { NextRequest, NextResponse } from 'next/server';
import { createClientServer } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const supabase = await createClientServer();
  await supabase.auth.signOut();

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = '/sign-in';
  redirectUrl.search = '';

  return NextResponse.redirect(redirectUrl, { status: 302 });
}
