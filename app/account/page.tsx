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
          <div className="button-row button-row--center">
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
    <main className="section">
      <div className="container account-container">
        <section className="feature-card account-overview">
          <div className="account-overview-header">
            <div>
              <span className="section-title">Perfil activo</span>
              <h1 className="account-heading">{profile?.email ?? user.email ?? 'Sin email'}</h1>
              <p className="link-muted" style={{ margin: 0 }}>Rol actual: {roleLabel}</p>
            </div>
            <div className="button-row account-overview-actions">
              <Link className="button secondary" href="/cart">
                {cartLabel}
              </Link>
            </div>
          </div>
        </section>

        <section id="seguridad" className="feature-card account-security">
          <div className="account-section-heading">
            <h2 style={{ margin: 0 }}>Seguridad</h2>
            <p className="link-muted" style={{ marginTop: 6 }}>
              Actualiza tus credenciales para mantener tu cuenta protegida.
            </p>
          </div>
          <div className="account-security-grid">
            <UpdateEmailForm initialEmail={profile?.email ?? user.email ?? ''} />
            <UpdatePasswordForm />
          </div>
        </section>

        <section id="actividades" className="feature-card account-activity">
          <div className="account-section-heading">
            <h2 style={{ margin: 0 }}>Tus actividades</h2>
            <p className="link-muted" style={{ marginTop: 6 }}>
              Aqui veras compras, sesiones y metricas de progreso cuando tengas movimiento.
            </p>
          </div>
          <div className="account-activity-placeholder">
            Aun no registras actividad. Agrega programas al carrito y confirma tu plan para comenzar.
          </div>
          <div className="button-row">
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
