import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getSessionWithProfile } from '@/lib/get-session';
import { getCartSummary } from '@/lib/cart';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'J-W Fitness Coaching',
  description:
    'Coaching fitness premium con planes personalizados, nutrici?n estrat?gica y seguimiento inteligente para l?deres ocupados.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await getSessionWithProfile();
  const session = user
    ? {
        email: profile?.email ?? user.email ?? '',
        role: profile?.role ?? 'user',
      }
    : null;

  const cartSummary = user ? await getCartSummary(user.id) : null;
  const cartCount = cartSummary?.itemCount ?? 0;

  return (
    <html lang="es">
      <body>
        <Navbar session={session} cartCount={cartCount} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
