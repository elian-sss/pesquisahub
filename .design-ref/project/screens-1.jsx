// Login screen + Dashboard variants

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');

  return (
    <div className="login-wrap">
      <div className="login-hero">
        <div className="row gap-3">
          <div className="brand-mark" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19V5l8 14L20 5v14"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600 }}>PesquisaHub</div>
            <div style={{ fontSize: 10.5, opacity: 0.7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pró-Reitoria de Pesquisa</div>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 44, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            A pesquisa<br/>da universidade,<br/><em style={{ color: 'var(--accent)', fontStyle: 'italic' }}>em um só lugar.</em>
          </div>
          <div style={{ marginTop: 24, fontSize: 14, opacity: 0.85, maxWidth: 460, lineHeight: 1.6 }}>
            Gerencie projetos de Iniciação Científica, P&D Embrapii e Extensão — do cadastro à prestação de contas — com transparência para coordenadores, bolsistas e gestores.
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 28, fontSize: 12, opacity: 0.75 }}>
          <div><span className="serif tnum" style={{ fontSize: 22, opacity: 1, display: 'block' }}>247</span>projetos ativos</div>
          <div><span className="serif tnum" style={{ fontSize: 22, opacity: 1, display: 'block' }}>R$ 18,4M</span>captados em 2025</div>
          <div><span className="serif tnum" style={{ fontSize: 22, opacity: 1, display: 'block' }}>1.842</span>bolsistas</div>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-form">
          <div className="serif" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.015em', marginBottom: 6 }}>Entrar na sua conta</div>
          <div className="muted" style={{ marginBottom: 28, fontSize: 13.5 }}>Use seu e-mail institucional e a senha do SIGAA.</div>

          <form onSubmit={e => { e.preventDefault(); onLogin('coord'); }}>
            <label className="label">E-mail institucional</label>
            <input className="input" placeholder="seunome@uni.edu.br" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 14 }}/>

            <label className="label">Senha</label>
            <input className="input" type="password" placeholder="••••••••" value={pwd} onChange={e => setPwd(e.target.value)} style={{ marginBottom: 8 }}/>

            <div style={{ textAlign: 'right', marginBottom: 18 }}>
              <a href="#" style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 500 }}>Esqueci minha senha</a>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
              Entrar
              <Icon name="arrowright" size={15}/>
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0 18px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
            <span className="text-xs muted-2" style={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500 }}>Acesso rápido — demo</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }}/>
          </div>

          <div className="col gap-2">
            {[
              { r: 'admin', label: 'Entrar como Admin', sub: 'Beatriz Souza · PROPESP', icon: 'sparkle' },
              { r: 'coord', label: 'Entrar como Coordenador', sub: 'Profa. Maria Silva', icon: 'bookmark' },
              { r: 'bolsista', label: 'Entrar como Bolsista', sub: 'João Pereira', icon: 'user' },
            ].map(o => (
              <button key={o.r} className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 14px' }} onClick={() => onLogin(o.r)}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--primary-tint)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                  <Icon name={o.icon} size={14}/>
                </span>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{o.label}</div>
                  <div className="text-xs muted">{o.sub}</div>
                </div>
                <Icon name="chevright" size={14}/>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== KPI Card =====
function KPI({ label, value, foot, footKind, icon, accent }) {
  return (
    <div className="kpi">
      <div className="kpi-label">
        {icon && <Icon name={icon} size={13}/>}
        {label}
      </div>
      <div className="kpi-value tnum" style={{ color: accent }}>{value}</div>
      {foot && <div className={`kpi-foot ${footKind || ''}`}>{foot}</div>}
    </div>
  );
}

// ===== Recharts wrapper helpers =====
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } = window.Recharts;

const CHART_COLORS = ['#0F4C5C', '#E8B339', '#5B7C7E', '#A87F3A', '#7D6B91', '#3B6E6F'];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A1A', color: '#fff', padding: '8px 12px', borderRadius: 8, fontSize: 12, boxShadow: 'var(--shadow-md)' }}>
      {label && <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="row tnum" style={{ gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }}/>
          <span style={{ opacity: 0.7 }}>{p.name}</span>
          <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ===== Admin Dashboard =====
function AdminDashboard({ goToProject, setScreen }) {
  const totalActive = PROJECTS.filter(p => p.status !== 'concluido').length;
  const totalCaptado = PROJECTS.reduce((s, p) => s + p.value, 0);
  const totalBolsistas = new Set(PROJECTS.flatMap(p => p.teamIds.filter(t => getPerson(t)?.role === 'Bolsista'))).size;
  const atrasados = PROJECTS.filter(p => p.status === 'atrasado').length;

  const byAgency = ['Embrapii', 'CNPq', 'FAPESPA', 'CAPES'].map(a => ({
    name: a,
    valor: PROJECTS.filter(p => p.agency === a).reduce((s, p) => s + p.value, 0) / 1000,
    projetos: PROJECTS.filter(p => p.agency === a).length,
  }));

  const byType = [
    { name: 'P&D Embrapii', value: PROJECTS.filter(p => p.type.includes('P&D')).length },
    { name: 'IC', value: PROJECTS.filter(p => p.type.includes('IC')).length },
    { name: 'Extensão', value: PROJECTS.filter(p => p.type === 'Extensão').length },
  ];

  return (
    <div className="col gap-6 fade-in">
      <div className="grid grid-4">
        <KPI label="Projetos ativos" value={totalActive} foot="↗ 3 este trimestre" footKind="up" icon="folder"/>
        <KPI label="Valor total captado" value={formatBRL(totalCaptado).replace('R$ ', 'R$ ')} foot="meta anual: R$ 22M" icon="chart" accent="var(--primary)"/>
        <KPI label="Bolsistas ativos" value={totalBolsistas} foot="em 5 projetos" icon="users"/>
        <KPI label="Projetos atrasados" value={atrasados} foot="requer atenção" footKind="down" icon="alert"/>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Captação por agência de fomento</div>
              <div className="text-xs muted">Valores em R$ mil — projetos ativos e concluídos</div>
            </div>
            <select className="select" style={{ width: 'auto' }}>
              <option>2025/2026</option>
              <option>2024</option>
            </select>
          </div>
          <div style={{ padding: 16, height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byAgency} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEDE6" vertical={false}/>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${v}k`}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Bar dataKey="valor" fill="#0F4C5C" radius={[6, 6, 0, 0]} name="R$ (mil)"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Distribuição por tipo</div>
          </div>
          <div style={{ padding: 16, height: 280, display: 'flex', flexDirection: 'column' }}>
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie data={byType} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {byType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]}/>)}
                </Pie>
                <Tooltip content={<ChartTooltip/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="col gap-2" style={{ marginTop: 'auto' }}>
              {byType.map((b, i) => (
                <div key={i} className="row text-xs" style={{ justifyContent: 'space-between' }}>
                  <span className="row gap-2">
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: CHART_COLORS[i] }}/>
                    {b.name}
                  </span>
                  <span className="tnum fw-600">{b.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Últimos projetos cadastrados</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setScreen('projects')}>Ver todos <Icon name="arrowright" size={13}/></button>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Tipo</th>
                <th>Coordenador</th>
                <th>Agência</th>
                <th>Valor</th>
                <th>Status</th>
                <th style={{ width: 140 }}>Progresso</th>
              </tr>
            </thead>
            <tbody>
              {PROJECTS.map(p => {
                const coord = getPerson(p.coordId);
                return (
                  <tr key={p.id} onClick={() => goToProject(p.id)}>
                    <td style={{ maxWidth: 320 }}>
                      <div className="fw-500" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                      <div className="text-xs muted">{p.tags.slice(0, 2).join(' · ')}</div>
                    </td>
                    <td><TypeBadge type={p.type} typeShort={p.typeShort}/></td>
                    <td>
                      <span className="row gap-2"><Avatar name={coord.name} size="sm"/><span className="text-xs">{coord.titulo} {coord.name.split(' ')[0]}</span></span>
                    </td>
                    <td className="text-xs">{p.agency}</td>
                    <td className="tnum text-xs fw-500">{formatBRL(p.value)}</td>
                    <td><StatusBadge status={p.status}/></td>
                    <td><Progress value={p.progress} status={p.status} showLabel/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===== Coordenador Dashboard =====
function CoordDashboard({ goToProject, setScreen }) {
  const myProjects = PROJECTS.filter(p => p.coordId === 'u1');
  const pendingHours = HOURS.filter(h => !h.approved && myProjects.some(p => p.id === h.projectId));
  const upcomingDeadlines = Object.values(MILESTONES).flat().filter(m => m.status === 'andamento').slice(0, 3);
  const totalUnderManagement = myProjects.reduce((s, p) => s + p.value, 0);

  return (
    <div className="col gap-6 fade-in">
      <div className="grid grid-4">
        <KPI label="Meus projetos ativos" value={myProjects.filter(p => p.status === 'andamento').length} foot={`${myProjects.length} projetos no total`} icon="folder"/>
        <KPI label="Horas pendentes" value={pendingHours.length} foot={pendingHours.length > 0 ? 'aprovação necessária' : 'tudo em dia'} footKind={pendingHours.length > 0 ? 'down' : 'up'} icon="clock"/>
        <KPI label="Metas próximas" value={upcomingDeadlines.length} foot="nas próximas 4 semanas" icon="target"/>
        <KPI label="Sob gestão" value={formatBRL(totalUnderManagement)} foot="2 fontes de fomento" icon="chart"/>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Meus projetos</div>
            <button className="btn btn-primary btn-sm" onClick={() => setScreen('newProject')}><Icon name="plus" size={13}/> Novo projeto</button>
          </div>
          <div className="col" style={{ padding: 8 }}>
            {myProjects.map(p => (
              <button key={p.id} className="card" style={{ padding: 16, textAlign: 'left', border: '1px solid transparent', display: 'block', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--line)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                onClick={() => goToProject(p.id)}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                  <div className="row gap-2">
                    <TypeBadge type={p.type} typeShort={p.typeShort}/>
                    <StatusBadge status={p.status}/>
                  </div>
                  <span className="tnum fw-600 text-xs">{p.progress}%</span>
                </div>
                <div className="fw-500" style={{ marginBottom: 8, fontSize: 14 }}>{p.title}</div>
                <Progress value={p.progress} status={p.status}/>
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 10 }}>
                  <AvatarStack names={p.teamIds.map(id => getPerson(id).name)}/>
                  <span className="text-xs muted">vigência até {formatDateShort(p.end)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="col gap-4">
          <div className="card">
            <div className="card-head">
              <div className="card-title">Pendências</div>
            </div>
            <div className="col" style={{ padding: 12, gap: 4 }}>
              <button className="dropdown-item" style={{ padding: 12 }} onClick={() => setScreen('hours')}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--warn-tint)', color: '#B45309', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="clock" size={15}/>
                </span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{pendingHours.length} registros de horas</div>
                  <div className="text-xs muted">aguardando sua aprovação</div>
                </div>
                <Icon name="chevright" size={14}/>
              </button>
              <button className="dropdown-item" style={{ padding: 12 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bad-tint)', color: '#B91C1C', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="alert" size={15}/>
                </span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>App mobile (Plataforma educacional)</div>
                  <div className="text-xs muted">entrega atrasada em 12 dias</div>
                </div>
                <Icon name="chevright" size={14}/>
              </button>
              <button className="dropdown-item" style={{ padding: 12 }}>
                <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-tint)', color: '#92580A', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="calendar" size={15}/>
                </span>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>Vigência se encerrando</div>
                  <div className="text-xs muted">Sensor IoT — 60 dias restantes</div>
                </div>
                <Icon name="chevright" size={14}/>
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-head">
              <div className="card-title">Horas da equipe — última semana</div>
            </div>
            <div style={{ padding: 12, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { d: 'Seg', h: 12 }, { d: 'Ter', h: 18 }, { d: 'Qua', h: 14 }, { d: 'Qui', h: 22 }, { d: 'Sex', h: 19 }, { d: 'Sáb', h: 4 }, { d: 'Dom', h: 0 },
                ]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ah" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0F4C5C" stopOpacity={0.25}/>
                      <stop offset="100%" stopColor="#0F4C5C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFEDE6" vertical={false}/>
                  <XAxis dataKey="d" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}/>
                  <Tooltip content={<ChartTooltip/>}/>
                  <Area type="monotone" dataKey="h" stroke="#0F4C5C" strokeWidth={2} fill="url(#ah)" name="horas"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Bolsista Dashboard =====
function BolsistaDashboard({ goToProject, setScreen }) {
  const myHours = HOURS.filter(h => h.userId === 'u4');
  const totalHours = myHours.reduce((s, h) => s + h.hours, 0);
  const myProjects = PROJECTS.filter(p => p.teamIds.includes('u4'));
  const myTasks = Object.values(MILESTONES).flat().flatMap(m => m.deliverables.map(d => ({ ...d, milestone: m.title }))).filter(d => d.assignee === 'u4');
  const pendingTasks = myTasks.filter(t => t.status !== 'concluido').length;

  return (
    <div className="col gap-6 fade-in">
      <div className="grid grid-4">
        <KPI label="Horas no mês" value={`${totalHours}h`} foot={`meta: 80h · ${Math.round(totalHours / 80 * 100)}%`} footKind="up" icon="clock"/>
        <KPI label="Tarefas pendentes" value={pendingTasks} foot={`em ${myProjects.length} projetos`} icon="flag"/>
        <KPI label="Próxima entrega" value="14 mai" foot="Automação Ansible" icon="calendar"/>
        <KPI label="Bolsa do mês" value={formatBRL(700)} foot="PIBIC · CNPq" icon="star" accent="var(--primary)"/>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1.4fr' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #0F4C5C 0%, #1A6878 100%)', color: '#fff', border: 0 }}>
          <div style={{ padding: 24 }}>
            <div className="text-xs" style={{ opacity: 0.8, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Hoje · {formatDate('2026-05-04')}</div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.25, marginBottom: 18 }}>
              Pronto para registrar suas horas?
            </div>
            <button className="btn btn-accent btn-lg" onClick={() => setScreen('hours')}>
              <Icon name="plus" size={15}/>
              Registrar horas hoje
            </button>
            <div className="row gap-4" style={{ marginTop: 24, opacity: 0.85 }}>
              <div>
                <div className="text-xs" style={{ opacity: 0.7 }}>esta semana</div>
                <div className="serif tnum" style={{ fontSize: 22, fontWeight: 500 }}>{myHours.slice(0, 4).reduce((s, h) => s + h.hours, 0)}h</div>
              </div>
              <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.2)' }}/>
              <div>
                <div className="text-xs" style={{ opacity: 0.7 }}>aprovadas</div>
                <div className="serif tnum" style={{ fontSize: 22, fontWeight: 500 }}>{myHours.filter(h => h.approved).reduce((s, h) => s + h.hours, 0)}h</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-title">Minhas tarefas</div>
            <span className="text-xs muted">{pendingTasks} pendentes</span>
          </div>
          <div className="col" style={{ padding: 8 }}>
            {myTasks.slice(0, 5).map(t => (
              <div key={t.id} className="row gap-3" style={{ padding: '10px 12px', borderRadius: 8 }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 5,
                  border: '1.5px solid ' + (t.status === 'concluido' ? 'var(--ok)' : 'var(--line)'),
                  background: t.status === 'concluido' ? 'var(--ok)' : 'transparent',
                  display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0,
                }}>
                  {t.status === 'concluido' && <Icon name="check" size={11} stroke={3}/>}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="fw-500 text-sm" style={{ textDecoration: t.status === 'concluido' ? 'line-through' : 'none', color: t.status === 'concluido' ? 'var(--muted)' : 'var(--ink)' }}>
                    {t.title}
                  </div>
                  <div className="text-xs muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.milestone}</div>
                </div>
                <StatusBadge status={t.status}/>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Projetos dos quais participo</div>
        </div>
        <div className="grid grid-2" style={{ padding: 16 }}>
          {myProjects.map(p => (
            <button key={p.id} className="card" style={{ padding: 16, textAlign: 'left', cursor: 'pointer' }} onClick={() => goToProject(p.id)}>
              <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
                <TypeBadge type={p.type} typeShort={p.typeShort}/>
                <StatusBadge status={p.status}/>
              </div>
              <div className="fw-500 text-sm" style={{ marginBottom: 6 }}>{p.title}</div>
              <div className="text-xs muted" style={{ marginBottom: 10 }}>Coordenado por {getPerson(p.coordId).titulo} {getPerson(p.coordId).name}</div>
              <Progress value={p.progress} status={p.status}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, AdminDashboard, CoordDashboard, BolsistaDashboard, KPI });
