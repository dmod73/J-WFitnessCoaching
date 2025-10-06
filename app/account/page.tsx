import Link from 'next/link';
import { getSessionWithProfile } from '@/lib/get-session';
import { getAdminClient } from '@/lib/supabase-admin';
import { getCartSummary } from '@/lib/cart';
import { UpdateEmailForm } from '@/components/UpdateEmailForm';
import { UpdatePasswordForm } from '@/components/UpdatePasswordForm';
import { AdminUsersPanel, AdminUserRow } from '@/components/AdminUsersPanel';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { user, profile } = await getSessionWithProfile();

  if (!user) {
    return (
      <main className="section" style={{ display: 'grid', placeItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
        <div className="feature-card" style={{ textAlign: 'center', gap: 16 }}>
          <h2>Tu sesion expiro</h2>
          <p className="link-muted">Ingresa nuevamente para ver tus planes y actividades.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link className="button primary" href="/sign-in">
              Iniciar sesion
            </Link>
            <Link className="button secondary" href="/sign-up">
              Crear cuenta
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const roleLabel = profile?.role === 'admin' ? 'Administrador' : 'Miembro';
  const cartSummary = await getCartSummary(user.id);
  const cartLabel = `Ver carrito (${cartSummary.itemCount})`;
  let adminUsers: AdminUserRow[] = [];

  if (profile?.role === 'admin') {
    const adminClient = getAdminClient();
    const { data } = await adminClient
      .from('profiles')
      .select('id,email,role,created_at')
      .order('created_at', { ascending: true });
    adminUsers = data ?? [];
  }

  return (
    <main className="section" style={{ display: 'grid', gap: 36 }}>
      <div className="container" style={{ display: 'grid', gap: 32 }}>
        <section className="feature-card" style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <span className="section-title">Perfil activo</span>
              <h1 style={{ margin: '10px 0 4px' }}>{profile?.email ?? user.email ?? 'Sin email'}</h1>
              <p className="link-muted" style={{ margin: 0 }}>Rol actual: {roleLabel}</p>
            </div>
            <Link className="button secondary" href="/cart">
              {cartLabel}
            </Link>
          </div>
        </section>

        <section id="seguridad" className="feature-card" style={{ display: 'grid', gap: 24 }}>
          <div>
            <h2 style={{ margin: 0 }}>Seguridad</h2>
            <p className="link-muted" style={{ marginTop: 6 }}>
              Actualiza tus credenciales para mantener tu cuenta protegida.
            </p>
          </div>
          <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <UpdateEmailForm initialEmail={profile?.email ?? user.email ?? ''} />
            <UpdatePasswordForm />
          </div>
        </section>

        <section id="actividades" className="feature-card" style={{ display: 'grid', gap: 16 }}>
          <div>
            <h2 style={{ margin: 0 }}>Tus actividades</h2>
            <p className="link-muted" style={{ marginTop: 6 }}>
              Aqui veras compras, sesiones y metricas de progreso cuando tengas movimiento.
            </p>
          </div>
          <div style={{
            border: '1px dashed rgba(124, 136, 152, 0.4)',
            borderRadius: 16,
            padding: '24px',
            textAlign: 'center',
            color: 'var(--color-muted)'
          }}>
            Aun no registras actividad. Agrega programas al carrito y confirma tu plan para comenzar.
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link className="button primary" href="/#programas">
              Explorar programas
            </Link>
            <Link className="button secondary" href="/cart">
              Ir al carrito
            </Link>
          </div>
        </section>

        {profile?.role === 'admin' && (
          <AdminUsersPanel currentUserId={user.id} initialUsers={adminUsers} />
        )}
      </div>
    </main>
  );
}
