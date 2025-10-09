'use client';

import { useEffect, useRef } from 'react';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function resolveNextTarget(searchParams: ReadonlyURLSearchParams): string {
  const directNext = searchParams.get('next');
  if (directNext) {
    return directNext;
  }

  const redirectToParam = searchParams.get('redirect_to');
  if (!redirectToParam) {
    return '/account';
  }

  try {
    const redirectUrl = new URL(redirectToParam);
    const nestedNext = redirectUrl.searchParams.get('next');
    if (nestedNext) {
      return nestedNext;
    }

    const composedPath = `${redirectUrl.pathname}${redirectUrl.search}`;
    return composedPath === '' ? '/account' : composedPath;
  } catch {
    return '/account';
  }
}

export function AuthCodeHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lastHandled = useRef<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      lastHandled.current = null;
      return;
    }

    const signature = `${pathname}?code=${code}`;
    if (lastHandled.current === signature) {
      return;
    }

    lastHandled.current = signature;

    const nextTarget = resolveNextTarget(searchParams);
    const redirectBase = searchParams.get('redirect_base');
    const callbackQuery = new URLSearchParams({
      code,
      next: nextTarget,
    }).toString();

    if (redirectBase && redirectBase.length > 0 && redirectBase !== window.location.origin) {
      window.location.href = `${redirectBase}/api/auth/callback?${callbackQuery}`;
      return;
    }

    router.replace(`/api/auth/callback?${callbackQuery}`);
  }, [pathname, router, searchParams]);

  return null;
}
