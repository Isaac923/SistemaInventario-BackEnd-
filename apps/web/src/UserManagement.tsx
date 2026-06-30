import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Usuario } from './api';
import { useState } from 'react';

export default function UserManagement() {
  const qc = useQueryClient();

  const { data: usuarios, isLoading, error } = useQuery<Usuario[]>({
    queryKey: ['usuarios'],
    queryFn: () => api.get('/usuarios').then(r => r.data),
  });

  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'CAJERO'>('CAJERO');
  const [actionPassword, setActionPassword] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setEmail(''); setPassword(''); setNombre(''); setRole('CAJERO'); setActionPassword('');
    setShowCreate(false); setEditingUser(null);
  };

  const createUser = useMutation({
    mutationFn: () => {
      const body: any = { email, password, nombre, role };
      if (role === 'ADMIN' && actionPassword.trim()) body.actionPassword = actionPassword;
      return api.post('/usuarios', body);
    },
    onSuccess: () => { resetForm(); qc.invalidateQueries({ queryKey: ['usuarios'] }); },
  });

  const updateUser = useMutation({
    mutationFn: () => {
      const body: any = {};
      if (email) body.email = email;
      if (nombre) body.nombre = nombre;
      if (password) body.password = password;
      body.role = role;
      if (actionPassword.trim()) body.actionPassword = actionPassword;
      return api.patch(`/usuarios/${editingUser!.id}`, body);
    },
    onSuccess: () => { resetForm(); qc.invalidateQueries({ queryKey: ['usuarios'] }); },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/usuarios/${id}`),
    onSuccess: () => { setShowDeleteId(null); qc.invalidateQueries({ queryKey: ['usuarios'] }); },
  });

  const startEdit = (u: Usuario) => {
    setEditingUser(u);
    setEmail(u.email);
    setNombre(u.nombre ?? '');
    setPassword('');
    setRole(u.role);
    setActionPassword('');
    setShowCreate(false);
  };

  const badgeStyle = (r: string) => ({
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600 as const,
    background: r === 'ADMIN' ? '#8b5cf620' : '#10b98120',
    color: r === 'ADMIN' ? '#a78bfa' : '#34d399',
  });

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden', marginBottom: 24 }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 16, color: '#f1f5f9' }}>👥 Gestión de Usuarios</h2>
        <button onClick={() => { resetForm(); setShowCreate(true); }}
          style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          + Nuevo Usuario
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreate || editingUser) && (
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155', background: '#0f172a' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: 14, color: '#f1f5f9' }}>
            {editingUser ? '✏️ Editar Usuario' : '➕ Crear Usuario'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Email *</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com"
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>{editingUser ? 'Nueva contraseña' : 'Contraseña *'}</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={editingUser ? 'Dejar vacío = sin cambios' : '••••••••'}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre opcional"
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Rol</label>
                <select value={role} onChange={e => setRole(e.target.value as 'ADMIN' | 'CAJERO')}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }}>
                  <option value="CAJERO">Cajero</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            {role === 'ADMIN' && (
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Contraseña de acción</label>
                <input type="password" value={actionPassword} onChange={e => setActionPassword(e.target.value)} placeholder="Para cajeros modificar productos"
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={resetForm}
                style={{ padding: '8px 12px', background: '#475569', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={() => editingUser ? updateUser.mutate() : createUser.mutate()}
                disabled={!email.trim() || (!editingUser && !password.trim()) || (editingUser ? updateUser.isPending : createUser.isPending)}
                style={{ padding: '8px 16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                {editingUser ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User list */}
      {isLoading && <p style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Cargando usuarios...</p>}
      {error && <p style={{ padding: 24, textAlign: 'center', color: '#ef4444' }}>Error cargando usuarios</p>}

      {!isLoading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              {['Email', 'Nombre', 'Rol', 'Creado', ''].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios?.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: '#475569' }}>No hay usuarios registrados.</td></tr>
            )}
            {usuarios?.map((u, i) => (
              <tr key={u.id} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : '#0f172a20' }}>
                <td style={{ padding: '12px 16px', color: '#e2e8f0', fontSize: 14 }}>{u.email}</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 14 }}>{u.nombre ?? '—'}</td>
                <td style={{ padding: '12px 16px' }}><span style={badgeStyle(u.role)}>{u.role}</span></td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 6 }}>
                  <button onClick={() => startEdit(u)}
                    style={{ padding: '4px 10px', background: '#3b82f620', color: '#60a5fa', border: '1px solid #3b82f640', borderRadius: 5, cursor: 'pointer', fontSize: 11 }}>
                    ✏️
                  </button>
                  <button onClick={() => setShowDeleteId(u.id)}
                    style={{ padding: '4px 10px', background: '#ef444420', color: '#f87171', border: '1px solid #ef444440', borderRadius: 5, cursor: 'pointer', fontSize: 11 }}>
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Delete confirmation */}
      {showDeleteId && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000080', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.5rem', border: '1px solid #334155', maxWidth: 400, width: '90%' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#f1f5f9', fontSize: 18 }}>¿Eliminar usuario?</h3>
            <p style={{ margin: '0 0 1.5rem', color: '#94a3b8' }}>Esta acción no se puede deshacer.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteId(null)}
                style={{ padding: '10px 16px', background: '#475569', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={() => deleteUser.mutate(showDeleteId)}
                style={{ padding: '10px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
