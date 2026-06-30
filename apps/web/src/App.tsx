import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, isAdmin } from './api';
import { useState, useEffect } from 'react';
import UserManagement from './UserManagement';

type Producto = {
  id: string;
  code: string;
  title: string;
  description?: string;
  cantidad: number;
  precio: number;
};

export default function App({ onLogout }: { onLogout?: () => void }) {
  const qc = useQueryClient();
  const userIsAdmin = isAdmin();
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: productos, isLoading, error } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: async () => (await api.get('/productos')).data,
  });

  const [code, setCode] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleteAdminPass, setDeleteAdminPass] = useState('');

  useEffect(() => {
    if (showForm && !editingProduct) {
      const nextNum = (productos?.length ?? 0) + 1;
      setCode(`SKU-${String(nextNum).padStart(3, '0')}`);
      setAdminPass('');
      setFormError(null);
    }
  }, [showForm, editingProduct, productos?.length]);

  const extraerError = (e: any) => {
    const msg = e?.response?.data?.message;
    const status = e?.response?.status;
    return Array.isArray(msg) ? msg.join(', ') : (msg ?? (status ? `Error ${status}` : 'No se pudo conectar con el servidor'));
  };

  const limpiarFormulario = () => {
    setCode(''); setNombre(''); setDescripcion('');
    setCantidad(''); setPrecio(''); setAdminPass('');
    setShowForm(false); setEditingProduct(null); setFormError(null);
  };

  const create = useMutation({
    mutationFn: async () => {
      const body: any = { code, title: nombre, description: descripcion, cantidad: Number(cantidad), precio: Number(precio) };
      if (!userIsAdmin) body.adminPassword = adminPass;
      return api.post('/productos', body);
    },
    onSuccess: () => {
      limpiarFormulario();
      qc.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: (e: any) => setFormError(extraerError(e)),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (userIsAdmin) {
        return api.delete(`/productos/${id}`);
      }
      return api.delete(`/productos/${id}`, {
        headers: { 'x-admin-password': deleteAdminPass },
      });
    },
    onSuccess: () => {
      setShowDeleteConfirm(null);
      setDeleteAdminPass('');
      qc.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: (e: any) => setFormError(extraerError(e)),
  });

  const edit = useMutation({
    mutationFn: async (p: Producto) => {
      const body: any = { code: p.code, title: p.title, description: p.description, cantidad: p.cantidad, precio: p.precio };
      if (!userIsAdmin) body.adminPassword = adminPass;
      return api.patch(`/productos/${p.id}`, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] });
      setEditingProduct(null); setAdminPass(''); setFormError(null);
    },
    onError: (e: any) => setFormError(extraerError(e)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!code.trim() || !nombre.trim()) return;
    if (editingProduct) {
      edit.mutate({
        id: editingProduct.id,
        code, title: nombre, description: descripcion,
        cantidad: Number(cantidad), precio: Number(precio),
      } as Producto);
    } else {
      create.mutate();
    }
  };

  const handleEdit = (p: Producto) => {
    setEditingProduct(p);
    setCode(p.code);
    setNombre(p.title);
    setDescripcion(p.description ?? '');
    setCantidad(String(p.cantidad));
    setPrecio(String(p.precio));
    setAdminPass('');
    setFormError(null);
    setShowForm(true);
  };

  const handleDeleteConfirm = () => {
    if (showDeleteConfirm) {
      remove.mutate(showDeleteConfirm);
    }
  };

  const handleCancel = () => {
    limpiarFormulario();
  };

  const totalProductos = productos?.length ?? 0;
  const totalStock = productos?.reduce((s, p) => s + p.cantidad, 0) ?? 0;
  const valorTotal = productos?.reduce((s, p) => s + p.cantidad * p.precio, 0) ?? 0;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'system-ui' }}>

      {/* Header */}
      <header style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>🛒</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f1f5f9' }}>Inventario Supermercado</h1>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>Sistema de gestión de productos</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setShowForm(!showForm); setShowUserMgmt(false); }}
            style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            {showForm ? '✕ Cancelar' : '+ Nuevo Producto'}
          </button>
          {userIsAdmin && (
            <button
              onClick={() => { setShowUserMgmt(!showUserMgmt); setShowForm(false); }}
              style={{ padding: '10px 20px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              {showUserMgmt ? '✕ Cerrar' : '👥 Usuarios'}
            </button>
          )}
          <button
            onClick={onLogout}
            style={{ padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            🚪 Cerrar sesión
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>

        {/* User Management Panel */}
        {showUserMgmt && userIsAdmin && <UserManagement />}

        {/* Tarjetas de resumen */}
        {!showUserMgmt && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Productos', value: totalProductos, icon: '📦', color: '#3b82f6' },
              { label: 'Unidades en Stock', value: totalStock, icon: '📊', color: '#10b981' },
              { label: 'Valor del Inventario', value: `$${valorTotal.toFixed(2)}`, icon: '💰', color: '#f59e0b' },
            ].map((card) => (
              <div key={card.label} style={{ background: '#1e293b', borderRadius: 12, padding: '1.25rem', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{card.label}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700, color: card.color }}>{card.value}</p>
                  </div>
                  <span style={{ fontSize: 32 }}>{card.icon}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.5rem', marginBottom: 24, border: '1px solid #334155' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: 16, color: '#f1f5f9' }}>{editingProduct ? '✏️ Editar producto' : '➕ Agregar nuevo producto'}</h2>
            {formError && (
              <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12, padding: '9px 12px', background: 'rgba(239,68,68,0.07)', borderRadius: 7, border: '1px solid rgba(239,68,68,0.16)' }}>
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Código *</label>
                  <input placeholder="SKU-001" value={code} onChange={(e) => setCode(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Nombre *</label>
                  <input placeholder="Nombre del producto" value={nombre} onChange={(e) => setNombre(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Descripción</label>
                  <input placeholder="Descripción opcional" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Cantidad</label>
                  <input placeholder="0" type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Precio ($)</label>
                  <input placeholder="0.00" type="number" value={precio} onChange={(e) => setPrecio(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                {!userIsAdmin && (
                  <div>
                    <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Contraseña de acción *</label>
                    <input placeholder="Contraseña de acción del admin" type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={handleCancel}
                    style={{ padding: '10px 16px', background: '#475569', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={!code.trim() || !nombre.trim() || (editingProduct ? edit.isPending : create.isPending) || (!userIsAdmin && !adminPass.trim())}
                    style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>
                    {editingProduct ? (edit.isPending ? 'Guardando...' : '✓ Guardar cambios') : (create.isPending ? 'Guardando...' : '✓ Guardar')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tabla */}
        {!showUserMgmt && (
          <div style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155' }}>
              <h2 style={{ margin: 0, fontSize: 16, color: '#f1f5f9' }}>📋 Lista de Productos</h2>
            </div>

            {isLoading && <p style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Cargando productos...</p>}
            {error && <p style={{ padding: 24, textAlign: 'center', color: '#ef4444' }}>Error cargando productos</p>}

            {!isLoading && !error && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0f172a' }}>
                    {['Código', 'Producto', 'Descripción', 'Cantidad', 'Precio', 'Valor Total', ''].map((h) => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productos?.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#475569' }}>
                      No hay productos registrados. ¡Agrega el primero!
                    </td></tr>
                  )}
                  {productos?.map((p, i) => (
                    <tr key={p.id} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : '#0f172a20' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: '#1d4ed820', color: '#60a5fa', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{p.code}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#f1f5f9' }}>{p.title}</td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 14 }}>{p.description ?? '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: p.cantidad < 10 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>{p.cantidad}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#e2e8f0' }}>${p.precio.toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: 600 }}>${(p.cantidad * p.precio).toFixed(2)}</td>
                      <td style={{ padding: '14px 16px', display: 'flex', gap: 8 }}>
                        <button onClick={() => handleEdit(p)}
                          style={{ padding: '6px 12px', background: '#3b82f620', color: '#60a5fa', border: '1px solid #3b82f640', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                          ✏️ Editar
                        </button>
                        <button onClick={() => { setShowDeleteConfirm(p.id); setDeleteAdminPass(''); }}
                          style={{ padding: '6px 12px', background: '#ef444420', color: '#f87171', border: '1px solid #ef444440', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                          🗑 Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000080', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.5rem', border: '1px solid #334155', maxWidth: 400, width: '90%' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#f1f5f9', fontSize: 18 }}>¿Eliminar producto?</h3>
            <p style={{ margin: '0 0 1.5rem', color: '#94a3b8' }}>¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.</p>
            {formError && (
              <div style={{ color: '#f87171', fontSize: 13, marginBottom: 12, padding: '9px 12px', background: 'rgba(239,68,68,0.07)', borderRadius: 7, border: '1px solid rgba(239,68,68,0.16)' }}>
                {formError}
              </div>
            )}
            {!userIsAdmin && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Contraseña de acción *</label>
                <input type="password" placeholder="Contraseña de acción del admin" value={deleteAdminPass} onChange={(e) => setDeleteAdminPass(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteConfirm(null)}
                style={{ padding: '10px 16px', background: '#475569', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
              <button onClick={handleDeleteConfirm} disabled={!userIsAdmin && !deleteAdminPass.trim()}
                style={{ padding: '10px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, opacity: (!userIsAdmin && !deleteAdminPass.trim()) ? 0.6 : 1 }}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
