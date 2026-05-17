// Shared UI primitives and app shell

const { useState, useEffect, useRef, useMemo, useCallback, Fragment } = React;

// ===== Icon =====
function Icon({ name, size = 16, stroke = 1.6 }) {
  const paths = {
    home: 'M3 11.5L12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9',
    folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z',
    calendar: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM4 10h16M8 2v4M16 2v4',
    clock: 'M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    chart: 'M3 3v18h18M7 14l4-4 4 4 5-6',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    plus: 'M12 5v14M5 12h14',
    chevdown: 'M6 9l6 6 6-6',
    chevright: 'M9 6l6 6-6 6',
    chevleft: 'M15 6l-9 6 9 6',
    check: 'M20 6L9 17l-5-5',
    x: 'M18 6L6 18M6 6l12 12',
    arrowright: 'M5 12h14M12 5l7 7-7 7',
    arrowleft: 'M19 12H5M12 19l-7-7 7-7',
    edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
    file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6',
    filter: 'M22 3H2l8 9.5V20l4 2v-9.5L22 3z',
    moreh: 'M5 12h.01M12 12h.01M19 12h.01',
    morev: 'M12 5h.01M12 12h.01M12 19h.01',
    target: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
    bookmark: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z',
    sparkle: 'M12 3L13.5 8.5 19 10 13.5 11.5 12 17 10.5 11.5 5 10 10.5 8.5 12 3zM19 3v4M21 5h-4M5 17v4M7 19H3',
    play: 'M5 3l14 9-14 9V3z',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
    git: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-4a3.4 3.4 0 0 0-1-2.6c3.3-.4 6.8-1.6 6.8-7.4a5.7 5.7 0 0 0-1.6-4 5.3 5.3 0 0 0-.1-3.9s-1.3-.4-4.2 1.6a14.5 14.5 0 0 0-7.6 0c-3-2-4.2-1.6-4.2-1.6A5.3 5.3 0 0 0 4.4 5.4a5.7 5.7 0 0 0-1.6 4c0 5.7 3.5 7 6.8 7.4a3.4 3.4 0 0 0-1 2.6v4',
    flag: 'M4 22V4a2 2 0 0 1 2-2h11l-1.5 4L17 10H6M4 22h16',
    menu: 'M3 6h18M3 12h18M3 18h18',
    inbox: 'M22 12h-6l-2 3h-4l-2-3H2M5.4 5.5L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.4-6.5a2 2 0 0 0-1.8-1.1H7.2a2 2 0 0 0-1.8 1.1z',
    book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
    eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    trash: 'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
    alert: 'M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
    star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1L12 2z',
    link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
    layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    refresh: 'M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15',
    paperclip: 'M21.4 11l-9.5 9.4a5.5 5.5 0 0 1-7.8-7.8l9.5-9.4a3.7 3.7 0 0 1 5.2 5.2l-9.5 9.4a1.8 1.8 0 0 1-2.6-2.6L15.3 7',
  };
  const d = paths[name] || paths.user;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={d}/>
    </svg>
  );
}

// ===== Avatar =====
function Avatar({ name, size = 'md', title }) {
  const cls = size === 'sm' ? 'avatar avatar-sm' : size === 'lg' ? 'avatar avatar-lg' : size === 'xl' ? 'avatar avatar-xl' : 'avatar';
  return (
    <span className={cls} style={{ background: avatarColor(name) }} title={title || name}>
      {initials(name)}
    </span>
  );
}

function AvatarStack({ names, max = 4 }) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <span className="avatar-stack">
      {shown.map((n, i) => <Avatar key={i} name={n} size="sm" />)}
      {extra > 0 && (
        <span className="avatar avatar-sm" style={{ background: '#E8E6DF', color: '#404040' }}>+{extra}</span>
      )}
    </span>
  );
}

// ===== Badge =====
function StatusBadge({ status }) {
  return (
    <span className={`badge ${statusBadgeClass(status)}`}>
      <span className="badge-dot"/>
      {statusLabel(status)}
    </span>
  );
}

function TypeBadge({ type, typeShort }) {
  const cls = type.startsWith('IC') ? 'b-amber' : type.startsWith('Extens') ? 'b-plan' : 'b-type';
  return <span className={`badge ${cls}`}>{typeShort || type}</span>;
}

// ===== Progress =====
function Progress({ value, status, showLabel = false }) {
  const cls = progressClass(value, status);
  return (
    <div className="row" style={{ gap: 10 }}>
      <div className="progress" style={{ flex: 1 }}>
        <div className={`progress-bar ${cls}`} style={{ width: `${value}%` }}/>
      </div>
      {showLabel && <span className="text-xs muted tnum" style={{ width: 30, textAlign: 'right' }}>{value}%</span>}
    </div>
  );
}

// ===== Toast =====
let toastQueue = [];
let setToastsRef = null;
function pushToast(text, kind = 'ok') {
  const id = Math.random().toString(36).slice(2);
  toastQueue = [...toastQueue, { id, text, kind }];
  if (setToastsRef) setToastsRef([...toastQueue]);
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    if (setToastsRef) setToastsRef([...toastQueue]);
  }, 3200);
}
function ToastHost() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { setToastsRef = setToasts; return () => { setToastsRef = null; }; }, []);
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span style={{ width: 8, height: 8, borderRadius: 99, background: t.kind === 'ok' ? '#10B981' : t.kind === 'warn' ? '#F59E0B' : '#EF4444' }}/>
          {t.text}
        </div>
      ))}
    </div>
  );
}

// ===== Profile Switcher =====
function ProfileSwitcher({ role, setRole }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const me = role === 'admin' ? getPerson('u0') : role === 'coord' ? getPerson('u1') : getPerson('u4');
  const roleLabel = role === 'admin' ? 'Admin' : role === 'coord' ? 'Coordenador' : 'Bolsista';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="profile-switcher" onClick={() => setOpen(o => !o)}>
        <span className="pill">{roleLabel}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Avatar name={me.name} size="sm"/>
          <span className="desktop-only">{me.name.split(' ').slice(0, 2).join(' ')}</span>
        </span>
        <Icon name="chevdown" size={14}/>
      </button>
      {open && (
        <div className="dropdown" style={{ minWidth: 260 }}>
          <div className="dropdown-section">Visualizar como</div>
          {[
            { v: 'admin', t: 'Admin', sub: 'Acesso institucional total', who: 'u0' },
            { v: 'coord', t: 'Coordenador', sub: 'Profa. Maria Silva', who: 'u1' },
            { v: 'bolsista', t: 'Bolsista', sub: 'João Pereira · 6º semestre', who: 'u4' },
          ].map(o => {
            const p = getPerson(o.who);
            return (
              <button key={o.v} className={`dropdown-item ${role === o.v ? 'active' : ''}`}
                onClick={() => { setRole(o.v); setOpen(false); pushToast(`Visualizando como ${o.t}`); }}>
                <Avatar name={p.name} size="sm"/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{o.t}</div>
                  <div className="text-xs muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.sub}</div>
                </div>
                {role === o.v && <Icon name="check" size={14}/>}
              </button>
            );
          })}
          <div className="dropdown-divider"/>
          <div className="dropdown-section">Demonstração</div>
          <div style={{ padding: '6px 10px 8px', fontSize: 11.5, color: 'var(--muted)' }}>
            Troque de perfil para ver como cada usuário interage com o sistema. Permissões e dados mudam ao vivo.
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Notification bell =====
function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn btn-ghost btn-icon notif-dot" onClick={() => setOpen(o => !o)}>
        <Icon name="bell" size={17}/>
      </button>
      {open && (
        <div className="dropdown" style={{ minWidth: 320 }}>
          <div className="dropdown-section">Notificações</div>
          {NOTIFICATIONS.map(n => (
            <button key={n.id} className="dropdown-item">
              <span style={{ width: 30, height: 30, borderRadius: 8, background: n.kind === 'warn' ? 'var(--bad-tint)' : 'var(--primary-tint)', color: n.kind === 'warn' ? '#B91C1C' : 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name={n.kind === 'warn' ? 'alert' : n.kind === 'task' ? 'flag' : 'clock'} size={14}/>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>{n.text}</div>
                <div className="text-xs muted-2" style={{ marginTop: 2 }}>há {n.time}</div>
              </div>
            </button>
          ))}
          <div className="dropdown-divider"/>
          <button className="dropdown-item" style={{ justifyContent: 'center', color: 'var(--primary)', fontWeight: 500 }}>
            Ver todas
          </button>
        </div>
      )}
    </div>
  );
}

// ===== Sidebar =====
function Sidebar({ screen, setScreen, role }) {
  const items = [
    { id: 'dashboard', label: 'Painel', icon: 'home' },
    { id: 'projects', label: 'Projetos', icon: 'folder' },
    { id: 'schedule', label: 'Cronograma', icon: 'calendar' },
    { id: 'hours', label: 'Horas', icon: 'clock', badge: role === 'coord' ? 5 : null },
    { id: 'reports', label: 'Relatórios', icon: 'chart' },
  ];
  if (role === 'admin') {
    items.push({ id: 'users', label: 'Usuários', icon: 'users' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19V5l8 14L20 5v14"/>
          </svg>
        </div>
        <div>
          <div className="brand-name">PesquisaHub</div>
          <div className="brand-sub">UFPA · 2025/2</div>
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Principal</div>
        {items.slice(0, 5).map(i => (
          <button key={i.id} className={`nav-item ${screen === i.id ? 'active' : ''}`} onClick={() => setScreen(i.id)}>
            <Icon name={i.icon} size={16}/>
            <span>{i.label}</span>
            {i.badge != null && <span className="badge">{i.badge}</span>}
          </button>
        ))}
        {items.slice(5).length > 0 && (
          <>
            <div className="nav-label" style={{ marginTop: 12 }}>Administração</div>
            {items.slice(5).map(i => (
              <button key={i.id} className={`nav-item ${screen === i.id ? 'active' : ''}`} onClick={() => setScreen(i.id)}>
                <Icon name={i.icon} size={16}/>
                <span>{i.label}</span>
              </button>
            ))}
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <button className="nav-item">
          <Icon name="settings" size={16}/>
          <span>Configurações</span>
        </button>
        <button className="nav-item" onClick={() => window.dispatchEvent(new CustomEvent('logout'))}>
          <Icon name="logout" size={16}/>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

// ===== Mobile bottom nav =====
function MobileNav({ screen, setScreen, role }) {
  const items = [
    { id: 'dashboard', label: 'Painel', icon: 'home' },
    { id: 'projects', label: 'Projetos', icon: 'folder' },
    { id: 'hours', label: 'Horas', icon: 'clock' },
    { id: 'schedule', label: 'Agenda', icon: 'calendar' },
    { id: 'reports', label: 'Relatórios', icon: 'chart' },
  ];
  return (
    <nav className="bottom-nav">
      {items.map(i => (
        <button key={i.id} className={`bn-item ${screen === i.id ? 'active' : ''}`} onClick={() => setScreen(i.id)}>
          <Icon name={i.icon} size={19}/>
          <span>{i.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ===== Topbar =====
function Topbar({ title, subtitle, actions, role, setRole }) {
  return (
    <header className="topbar">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-sub">{subtitle}</div>}
      </div>
      <div className="row" style={{ gap: 10 }}>
        {actions}
        <NotificationBell/>
        <ProfileSwitcher role={role} setRole={setRole}/>
      </div>
    </header>
  );
}

// ===== Empty state =====
function Empty({ icon = 'inbox', title, sub, action }) {
  return (
    <div className="empty">
      <div style={{ display: 'inline-grid', placeItems: 'center', width: 44, height: 44, borderRadius: 12, background: '#fff', border: '1px solid var(--line)', color: 'var(--muted-2)', marginBottom: 12 }}>
        <Icon name={icon} size={20}/>
      </div>
      <div style={{ fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>{title}</div>
      {sub && <div className="text-xs muted" style={{ maxWidth: 320, margin: '0 auto' }}>{sub}</div>}
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}

// ===== Modal =====
function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {title && (
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="serif" style={{ fontSize: 18, fontWeight: 600 }}>{title}</div>
            <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="x"/></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

Object.assign(window, {
  Icon, Avatar, AvatarStack, StatusBadge, TypeBadge, Progress, ToastHost, pushToast,
  ProfileSwitcher, NotificationBell, Sidebar, MobileNav, Topbar, Empty, Modal,
});
