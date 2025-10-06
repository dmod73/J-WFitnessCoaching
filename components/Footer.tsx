import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container" style={{ display: 'grid', gap: 8 }}>
        <div>
          Copyright {new Date().getFullYear()} J-W Fitness Coaching. Todos los derechos reservados.
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link className="link-muted" href="/sign-in">
            Acceder
          </Link>
          <Link className="link-muted" href="/sign-up">
            Registrarme
          </Link>
          <Link className="link-muted" href="mailto:coach@jwfitness.co">
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
}


