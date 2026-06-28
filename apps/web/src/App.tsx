import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { useState, useEffect } from 'react';

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

  const { data: productos, isLoading, error } = useQuery<Producto[]>({
    queryKey: ['productos'],
    queryFn: async () => (await api.get('/productos')).data,
  });

  const [code, setCode] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Auto-generar SKU al abrir el formulario
  useEffect(() => {
    if (showForm) {
      const nextNum = (productos?.length ?? 0) + 1;
      setCode(`SKU-${String(nextNum).padStart(3, '0')}`);
    }
  }, [showForm, productos?.length]);

  const create = useMutation({
    mutationFn: async () =>
      api.post('/productos', {
        code,
        title: nombre,
        description: descripcion,
        cantidad: Number(cantidad),
        precio: Number(precio),
      }),
    onSuccess: () => {
      setCode(''); setNombre(''); setDescripcion('');
      setCantidad(''); setPrecio('');
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ['productos'] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/productos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['productos'] }),
  });

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
            onClick={() => setShowForm(!showForm)}
            style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            {showForm ? '✕ Cancelar' : '+ Nuevo Producto'}
          </button>
          <button
            onClick={onLogout}
            style={{ padding: '10px 20px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            🚪 Cerrar sesión
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Tarjetas de resumen */}
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

        {/* Formulario */}
        {showForm && (
          <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.5rem', marginBottom: 24, border: '1px solid #334155' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: 16, color: '#f1f5f9' }}>➕ Agregar nuevo producto</h2>
            <form onSubmit={(e) => { e.preventDefault(); if (code.trim() && nombre.trim()) create.mutate(); }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
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
                <button type="submit" disabled={!code.trim() || !nombre.trim() || create.isPending}
                  style={{ padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>
                  {create.isPending ? 'Guardando...' : '✓ Guardar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla */}
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
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => remove.mutate(p.id)}
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
      </main>
    </div>
  );
}