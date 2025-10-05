import Link from 'next/link';
import { getSessionWithProfile } from '@/lib/get-session';

export default async function AccountPage() {
  const { user, profile } = await getSessionWithProfile();

  if (!user) {
    return (
      <main style={{ display: 'grid', placeItems: 'center', minHeight: '60dvh' }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <p>No has iniciado sesión.</p>
          <Link href='/sign-in'>Ir a iniciar sesión</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '60dvh', gap: 16 }}>
      <div style={{ display: 'grid', gap: 8, minWidth: 320 }}>
        <h1>Mi cuenta</h1>
        <p>
          <strong>Email:</strong> {profile?.email ?? user.email}
        </p>
        <p>
          <strong>Rol:</strong> {profile?.role ?? 'user'}
        </p>
      </div>
      <form action='/api/auth/signout' method='post'>
        <button type='submit'>Cerrar sesión</button>
      </form>
    </main>
  );
}
