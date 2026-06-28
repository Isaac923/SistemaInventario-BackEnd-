import { useState } from 'react';
import { api } from './api';

export default function Auth({ onLogged }: { onLogged: () => void }) {
  const [mode, setMode]       = useState<'login' | 'signup'>('login');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [adminPass, setAdmin] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState<string | null>(null);

  const switchTab = (m: 'login' | 'signup') => {
    setMode(m);
    setErr(null);
    setEmail('');
    setPass('');
    setAdmin('');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setErr('Completa todos los campos requeridos.'); return; }
    if (password.length < 6) { setErr('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (mode === 'signup' && !adminPass.trim()) { setErr('Se requiere la contraseña de administrador.'); return; }
    setLoading(true);
    setErr(null);
    try {
      const url  = mode === 'login' ? '/auth/login' : '/auth/signup';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, adminPassword: adminPass };
      const { data } = await api.post(url, body);
      localStorage.setItem('token', data.access_token);
      onLogged();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setErr(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Error al autenticar'));
    } finally {
      setLoading(false);
    }
  };

  const S = {
    page: {
      minHeight: '100vh', background: '#0f172a',
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    } as React.CSSProperties,

    left: {
      background: '#1a2744',
      display: 'flex', flexDirection: 'column' as const,
      justifyContent: 'center', padding: '3rem',
      position: 'relative' as const, overflow: 'hidden',
    },

    leftBg: {
      position: 'absolute' as const,
      inset: 0,
      backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      filter: 'blur(4px) brightness(0.4)',
      zIndex: 0,
    },

    leftContent: {
      position: 'relative' as const,
      zIndex: 1,
      maxWidth: 360,
    },

    leftIcon: { fontSize: 52, marginBottom: '1.5rem' },

    leftH2: { fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: '0 0 12px' },

    leftP: { fontSize: 16, color: '#cbd5e1', lineHeight: 1.7, margin: 0 },

    right: {
      display: 'flex', flexDirection: 'column' as const,
      justifyContent: 'center', alignItems: 'center',
      padding: '3rem 2.5rem',
    },

    formCard: { width: '100%', maxWidth: 340 },

    formTitle: { fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' },
    formSub:   { fontSize: 13, color: '#64748b', margin: '0 0 1.75rem' },

    tabs: {
      display: 'flex', background: '#0f172a',
      borderRadius: 9, padding: 3, marginBottom: '1.75rem',
      border: '1px solid #334155',
    },

    tab: (active: boolean): React.CSSProperties => ({
      flex: 1, padding: '8px', textAlign: 'center',
      borderRadius: 7, fontSize: 13, fontWeight: 600,
      cursor: 'pointer', border: 'none', transition: 'all .2s',
      background: active ? '#1e293b' : 'transparent',
      color: active ? '#f1f5f9' : '#64748b',
    }),

    field: { marginBottom: '1.1rem' },

    label: {
      display: 'block', fontSize: 11, fontWeight: 600,
      color: '#94a3b8', marginBottom: 5,
      textTransform: 'uppercase' as const, letterSpacing: '0.05em',
    },

    inputWrap: { position: 'relative' as const },

    icon: {
      position: 'absolute' as const, left: 11,
      top: '50%', transform: 'translateY(-50%)',
      color: '#475569', fontSize: 16, pointerEvents: 'none' as const,
    },

    input: {
      width: '100%', padding: '10px 12px 10px 36px',
      background: '#0f172a', border: '1px solid #334155',
      borderRadius: 8, color: '#e2e8f0', fontSize: 14,
      outline: 'none', boxSizing: 'border-box' as const,
      fontFamily: 'system-ui',
    },

    errBox: {
      color: '#f87171', fontSize: 12, marginBottom: 10,
      padding: '9px 12px', background: 'rgba(239,68,68,0.07)',
      borderRadius: 7, border: '1px solid rgba(239,68,68,0.16)',
    },

    btn: (loading: boolean): React.CSSProperties => ({
      width: '100%', padding: 11,
      background: loading ? '#1d4ed8' : '#3b82f6',
      color: '#fff', border: 'none', borderRadius: 8,
      fontSize: 14, fontWeight: 600,
      cursor: loading ? 'not-allowed' : 'pointer',
      marginTop: 4, opacity: loading ? 0.8 : 1,
    }),
  };

  return (
    <div style={S.page}>

      {/* Panel izquierdo — foto difuminada + texto */}
      <div style={S.left}>
        <div style={S.leftBg} aria-hidden="true" />
        <div style={S.leftContent}>
          <div style={S.leftIcon}>🛒</div>
          <h2 style={S.leftH2}>Inventario Supermercado</h2>
          <p style={S.leftP}>
            Controla el stock, registra productos y gestiona tu inventario
            de forma sencilla y segura. Diseñado para locales que necesitan
            agilidad y claridad en su día a día.
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={S.right}>
        <div style={S.formCard}>

          <p style={S.formTitle}>
            {mode === 'login' ? 'Bienvenido' : 'Crear cuenta'}
          </p>
          <p style={S.formSub}>
            {mode === 'login'
              ? 'Ingresa tus credenciales para continuar'
              : 'Completa los datos del nuevo usuario'}
          </p>

          {/* Tabs */}
          <div style={S.tabs}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} type="button" onClick={() => switchTab(m)} style={S.tab(mode === m)}>
                {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          
          <form onSubmit={submit}>

            {/* Email */}
            <div style={S.field}>
              <label style={S.label}>Correo electrónico</label>
              <div style={S.inputWrap}>
                <span style={S.icon}>✉️</span>
                <input
                  style={S.input} type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div style={S.field}>
              <label style={S.label}>Contraseña</label>
              <div style={S.inputWrap}>
                <span style={S.icon}>🔒</span>
                <input
                  style={S.input} type="password"
                  placeholder="••••••••"
                  value={password} onChange={e => setPass(e.target.value)}
                />
              </div>
            </div>

            {/* Contraseña de administrador — solo en signup */}
            {mode === 'signup' && (
              <div style={S.field}>
                <label style={S.label}>Contraseña de administrador</label>
                <div style={S.inputWrap}>
                  <span style={S.icon}>🛡️</span>
                  <input
                    style={S.input} type="password"
                    placeholder="Contraseña del admin"
                    value={adminPass} onChange={e => setAdmin(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {err && <div style={S.errBox}>{err}</div>}

            <button type="submit" disabled={loading} style={S.btn(loading)}>
              {loading ? '...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}