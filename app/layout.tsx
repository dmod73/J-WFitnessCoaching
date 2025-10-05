import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'J-WFitnessCoaching',
  description: 'Cursos fitness de pago único',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='es'>
      <body>{children}</body>
    </html>
  );
}
