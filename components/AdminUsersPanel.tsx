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
      setStatus(null);
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
      setStatus('Usuario promovido.');
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
    <section className="feature-card admin-panel">
      <div className="admin-panel-header">
        <div>
          <h2 style={{ margin: 0 }}>Usuarios del programa</h2>
          <p className="link-muted" style={{ marginTop: 4 }}>
            Gestiona roles y acceso. Solo admins pueden realizar cambios.
          </p>
        </div>
        <button type="button" onClick={refreshUsers} className="button secondary button--compact" disabled={isPending}>
          {isPending ? 'Actualizando...' : 'Refrescar lista'}
        </button>
      </div>
      {status && <p className="admin-panel-status">{status}</p>}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Rol</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td data-label="Email">{user.email ?? 'Sin email'}</td>
                <td data-label="Rol" style={{ textTransform: 'capitalize' }}>{user.role}</td>
                <td data-label="Accion" className="admin-table-actions">
                  <div className="table-actions">
                    {user.role !== 'admin' && (
                      <button
                        type="button"
                        className="button secondary button--compact"
                        onClick={() => promoteUser(user.id)}
                        disabled={isPending}
                      >
                        Promover
                      </button>
                    )}
                    {user.id !== currentUserId && (
                      <button
                        type="button"
                        className="button secondary button--compact"
                        onClick={() => removeUser(user.id)}
                        disabled={isPending}
                      >
                        Eliminar
                      </button>
                    )}
                    {user.id === currentUserId && <span className="link-muted">Sesion actual</span>}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td data-label="Sin datos" colSpan={3} className="admin-table-empty">
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
