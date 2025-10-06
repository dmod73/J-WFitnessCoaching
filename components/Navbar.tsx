'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' });
    startTransition(() => {
      router.replace('/sign-in');
      router.refresh();
    });
    setMenuOpen(false);
    setMobileMenuOpen(false);
  }

  const navItems = [...publicLinks, ...(session ? protectedLinks : [])];
  const avatarLetter = session?.email?.charAt(0)?.toUpperCase() ?? 'J';
  const cartDisplay = formatCartCount(cartCount);

  return (
    <nav>
      <div className="container navbar">
        <Link href="/" className="logo" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>
          <strong>J-W</strong> Fitness Coaching
        </Link>
        <div className="nav-inline">
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={mobileMenuOpen}
            aria-controls="nav-mobile"
            onClick={() => setMobileMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="nav-actions-desktop">
            <ul className="nav-links">
              {navItems.map((link) => (
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
      </div>
      <div id="nav-mobile" className={`nav-mobile ${mobileMenuOpen ? 'nav-mobile--open' : ''}`} aria-hidden={!mobileMenuOpen}>
        <div className="container nav-mobile-inner">
          <ul className="nav-mobile-links">
            {navItems.map((link) => (
              <li key={link.href}>
                <Link className={pathname === link.href ? 'active' : ''} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link className="cart-chip nav-mobile-cart" href="/cart" onClick={() => setMobileMenuOpen(false)}>
            <span>Carrito</span>
            <span className="cart-count">{cartDisplay}</span>
          </Link>
          <div className="nav-mobile-footer">
            {session ? (
              <>
                <div className="nav-mobile-user">
                  <strong>{session.email}</strong>
                  <span>{session.role === 'admin' ? 'Admin' : 'Miembro'}</span>
                </div>
                <Link className="button secondary" href="/account" onClick={() => setMobileMenuOpen(false)}>
                  Mi cuenta
                </Link>
                <button className="button secondary" type="button" onClick={handleSignOut} disabled={isPending}>
                  {isPending ? 'Saliendo...' : 'Cerrar sesion'}
                </button>
              </>
            ) : (
              <>
                <Link className="button primary" href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  Iniciar sesion
                </Link>
                <Link className="button secondary" href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
