import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function extractNextPath(redirectToParam: string | null, fallback: string): string {
  if (!redirectToParam) {
    return fallback;
  }

  try {
    const redirectTarget = new URL(redirectToParam);
    return redirectTarget.searchParams.get('next') ?? fallback;
  } catch {
    return fallback;
  }
}

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const code = nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.next();
  }

  if (nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const redirectToParam = nextUrl.searchParams.get('redirect_to');
  const directNextParam = nextUrl.searchParams.get('next');
  const desiredNext = directNextParam ?? extractNextPath(redirectToParam, '/account');

  const callbackUrl = new URL('/api/auth/callback', nextUrl.origin);
  callbackUrl.searchParams.set('code', code);
  callbackUrl.searchParams.set('next', desiredNext);

  return NextResponse.redirect(callbackUrl);
}

export const config = {
  matcher: ['/((?!_next/|static/|api/auth/callback).*)'],
};
