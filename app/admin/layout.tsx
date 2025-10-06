import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSessionWithProfile } from '@/lib/get-session';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await getSessionWithProfile();

  if (!user || profile?.role !== 'admin') {
    redirect('/sign-in');
  }

  return <>{children}</>;
}
