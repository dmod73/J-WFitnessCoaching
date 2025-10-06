'use client';
import { useState, useTransition } from 'react';

export type AdminUserRow = {
  id: string;
  email: string | null;
  role: 'admin' | 'user';
  created_at: string | null;
};

interface AdminUsersPanelProps {
  currentUserId: string;
  initialUsers: AdminUserRow[];
}

export function AdminUsersPanel({ currentUserId, initialUsers }: AdminUsersPanelProps) {
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refreshUsers() {
    startTransition(async () => {
      const response = await fetch('/api/admin/users', { cache: 'no-store' });
      const payload = (await response.json().catch(() => null)) ?? {};
      if (!response.ok) {
        setStatus((payload as { error?: string }).error ?? 'No se pudo refrescar la lista.');
        return;
      }
      setUsers(((payload as { users?: AdminUserRow[] }).users) ?? []);
    });
  }

  function promoteUser(userId: string) {
    startTransition(async () => {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: 'admin' }),
      });
      const payload = (await response.json().catch(() => null)) ?? {};
      if (!response.ok) {
        setStatus((payload as { error?: string }).error ?? 'No se pudo actualizar el rol.');
        return;
      }
      setStatus('Usuario promovido a admin.');
      refreshUsers();
    });
  }

  function removeUser(userId: string) {
    if (!confirm('Seguro que deseas eliminar este usuario?')) return;
    startTransition(async () => {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const payload = (await response.json().catch(() => null)) ?? {};
      if (!response.ok) {
        setStatus((payload as { error?: string }).error ?? 'No se pudo eliminar al usuario.');
        return;
      }
      setStatus('Usuario eliminado.');
      refreshUsers();
    });
  }

  return (
    <div className="feature-card" style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0 }}>Usuarios del programa</h2>
          <p className="link-muted" style={{ marginTop: 4 }}>
            Gestiona roles y acceso. Solo admins pueden realizar cambios.
          </p>
        </div>
        <button type="button" onClick={refreshUsers} className="button secondary" disabled={isPending}>
          {isPending ? 'Actualizando...' : 'Refrescar lista'}
        </button>
      </div>
      {status && <p className="message" style={{ margin: 0 }}>{status}</p>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--color-muted)', fontWeight: 500 }}>
              <th style={{ padding: '12px 8px' }}>Email</th>
              <th style={{ padding: '12px 8px' }}>Rol</th>
              <th style={{ padding: '12px 8px' }}>Accion</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderTop: '1px solid rgba(124, 136, 152, 0.15)' }}>
                <td style={{ padding: '12px 8px' }}>{user.email ?? 'Sin email'}</td>
                <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>{user.role}</td>
                <td style={{ padding: '12px 8px', display: 'flex', gap: 8 }}>
                  {user.role !== 'admin' && (
                    <button type="button" className="button secondary" onClick={() => promoteUser(user.id)} disabled={isPending}>
                      Promover a admin
                    </button>
                  )}
                  {user.id !== currentUserId && (
                    <button type="button" className="button secondary" onClick={() => removeUser(user.id)} disabled={isPending}>
                      Eliminar
                    </button>
                  )}
                  {user.id === currentUserId && <span className="link-muted">Sesion actual</span>}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td style={{ padding: '16px 8px', color: 'var(--color-muted)' }} colSpan={3}>
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
