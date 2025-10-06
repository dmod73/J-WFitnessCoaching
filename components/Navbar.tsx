'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';

type NavbarSession = {
  email: string;
  role?: 'admin' | 'user';
};

const publicLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/#programas', label: 'Programas' },
  { href: '/imc', label: 'IMC' },
];

const protectedLinks = [
  { href: '/account', label: 'Mi panel' },
];

interface NavbarProps {
  session: NavbarSession | null;
  cartCount: number;
}

function formatCartCount(count: number) {
  if (count > 99) {
    return '99+';
  }

  return String(count ?? 0);
}

export function Navbar({ session, cartCount }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    startTransition(() => {
      router.replace('/sign-in');
      router.refresh();
    });
  }

  const avatarLetter = session?.email?.charAt(0)?.toUpperCase() ?? 'J';
  const cartDisplay = formatCartCount(cartCount);

  return (
    <nav>
      <div className="container navbar">
        <Link href="/" className="logo" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>
          <strong>J-W</strong> Fitness Coaching
        </Link>
        <div className="nav-actions">
          <ul className="nav-links">
            {[...publicLinks, ...(session ? protectedLinks : [])].map((link) => (
              <li key={link.href}>
                <Link className={pathname === link.href ? 'active' : ''} href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link className="cart-chip" href="/cart" aria-label={`Ver carrito (${cartDisplay} cursos)`}>
            <span>Carrito</span>
            <span className="cart-count">{cartDisplay}</span>
          </Link>
          {session ? (
            <div className="avatar-wrapper">
              <button
                type="button"
                className="avatar"
                aria-label="Menu de usuario"
                onClick={() => setMenuOpen((value) => !value)}
              >
                {avatarLetter}
              </button>
              {menuOpen && (
                <div className="avatar-menu">
                  <div className="avatar-info">
                    <span>{session.email}</span>
                    <small>{session.role === 'admin' ? 'Admin' : 'Miembro'}</small>
                  </div>
                  <Link href="/account" onClick={() => setMenuOpen(false)}>
                    Ver perfil
                  </Link>
                  <Link href="/account#seguridad" onClick={() => setMenuOpen(false)}>
                    Seguridad
                  </Link>
                  <Link href="/account#actividades" onClick={() => setMenuOpen(false)}>
                    Actividades
                  </Link>
                  <button type="button" onClick={handleSignOut} disabled={isPending}>
                    {isPending ? 'Saliendo...' : 'Cerrar sesion'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-cta">
              <Link className="button secondary" href="/sign-in">
                Iniciar sesion
              </Link>
              <Link className="button primary" href="/sign-up">
                Comenzar ahora
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
