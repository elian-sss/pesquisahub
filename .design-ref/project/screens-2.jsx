// Lista de Projetos + Detalhe + Cronograma

function ProjectsList({ goToProject, role, setScreen }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterAgency, setFilterAgency] = useState('todos');
  const [view, setView] = useState('table');

  const list = useMemo(() => {
    let out = PROJECTS;
    if (role === 'coord') out = out.filter(p => p.coordId === 'u1');
    if (role === 'bolsista') out = out.filter(p => p.teamIds.includes('u4'));
    if (search) out = out.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    if (filterType !== 'todos') out = out.filter(p => p.typeShort === filterType);
    if (filterStatus !== 'todos') out = out.filter(p => p.status === filterStatus);
    if (filterAgency !== 'todos') out = out.filter(p => p.agency === filterAgency);
    return out;
  }, [search, filterType, filterStatus, filterAgency, role]);

  const canCreate = role === 'admin' || role === 'coord';

  return (
    <div className="col gap-4 fade-in">
      <div className="card">
        <div style={{ padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="input-icon" style={{ flex: '1 1 240px', minWidth: 200 }}>
            <Icon name="search" size={15}/>
            <input className="input" placeholder="Buscar projeto por título…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <select className="select" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="todos">Todos os tipos</option>
            <option value="P&D">P&D Embrapii</option>
            <option value="IC">Iniciação Científica</option>
            <option value="EXT">Extensão</option>
          </select>
          <select className="select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="todos">Todos os status</option>
            <option value="andamento">Em andamento</option>
            <option value="atrasado">Atrasado</option>
            <option value="concluido">Concluído</option>
            <option value="planejado">Planejado</option>
          </select>
          <select className="select" style={{ width: 'auto' }} value={filterAgency} onChange={e => setFilterAgency(e.target.value)}>
            <option value="todos">Todas as agências</option>
            <option>Embrapii</option><option>CNPq</option><option>FAPESPA</option><option>CAPES</option>
          </select>
          <div className="row gap-2 desktop-only" style={{ marginLeft: 'auto' }}>
            <div className="row" style={{ background: '#FBFAF6', borderRadius: 8, padding: 3, border: '1px solid var(--line)' }}>
              <button className={`btn btn-sm ${view === 'table' ? 'btn-outline' : 'btn-ghost'}`} style={{ background: view === 'table' ? '#fff' : 'transparent', border: 'none' }} onClick={() => setView('table')}><Icon name="list" size={13}/></button>
              <button className={`btn btn-sm ${view === 'grid' ? 'btn-outline' : 'btn-ghost'}`} style={{ background: view === 'grid' ? '#fff' : 'transparent', border: 'none' }} onClick={() => setView('grid')}><Icon name="grid" size={13}/></button>
            </div>
            {canCreate && (
              <button className="btn btn-primary" onClick={() => setScreen('newProject')}><Icon name="plus" size={14}/> Novo projeto</button>
            )}
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <Empty title="Nenhum projeto encontrado" sub="Tente ajustar os filtros ou limpar a busca."/>
      ) : view === 'table' ? (
        <div className="card desktop-only">
          <div style={{ overflow: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Tipo</th>
                  <th>Coordenador</th>
                  <th>Equipe</th>
                  <th>Vigência</th>
                  <th>Status</th>
                  <th style={{ width: 160 }}>Progresso</th>
                </tr>
              </thead>
              <tbody>
                {list.map(p => {
                  const coord = getPerson(p.coordId);
                  return (
                    <tr key={p.id} onClick={() => goToProject(p.id)}>
                      <td style={{ maxWidth: 380 }}>
                        <div className="fw-500" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                        <div className="text-xs muted">{p.agency} · {formatBRL(p.value)}</div>
                      </td>
                      <td><TypeBadge type={p.type} typeShort={p.typeShort}/></td>
                      <td><span className="row gap-2"><Avatar name={coord.name} size="sm"/><span className="text-xs">{coord.name.split(' ')[0]} {coord.name.split(' ').slice(-1)[0]}</span></span></td>
                      <td><AvatarStack names={p.teamIds.map(id => getPerson(id).name)}/></td>
                      <td className="text-xs muted">{formatDateShort(p.start)} → {formatDateShort(p.end)}</td>
                      <td><StatusBadge status={p.status}/></td>
                      <td><Progress value={p.progress} status={p.status} showLabel/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {(view === 'grid' || true) && (
        <div className={view === 'grid' ? '' : 'mobile-only'}>
          <div className="grid grid-3">
            {list.map(p => {
              const coord = getPerson(p.coordId);
              return (
                <button key={p.id} className="card" style={{ padding: 18, textAlign: 'left', cursor: 'pointer' }} onClick={() => goToProject(p.id)}>
                  <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
                    <TypeBadge type={p.type} typeShort={p.typeShort}/>
                    <StatusBadge status={p.status}/>
                  </div>
                  <div className="fw-500" style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.4 }}>{p.title}</div>
                  <div className="text-xs muted" style={{ marginBottom: 14 }}>{p.agency} · {formatBRL(p.value)}</div>
                  <Progress value={p.progress} status={p.status} showLabel/>
                  <div className="row" style={{ justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line-2)' }}>
                    <span className="row gap-2 text-xs muted"><Avatar name={coord.name} size="sm"/>{coord.name.split(' ')[0]}</span>
                    <AvatarStack names={p.teamIds.map(id => getPerson(id).name)}/>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="row" style={{ justifyContent: 'space-between', padding: '8px 4px' }}>
        <span className="text-xs muted">Mostrando {list.length} de {PROJECTS.length} projetos</span>
        <div className="row gap-2">
          <button className="btn btn-outline btn-sm" disabled style={{ opacity: 0.5 }}><Icon name="chevleft" size={13}/></button>
          <button className="btn btn-outline btn-sm">1</button>
          <button className="btn btn-outline btn-sm" disabled style={{ opacity: 0.5 }}><Icon name="chevright" size={13}/></button>
        </div>
      </div>
    </div>
  );
}

// ===== Project Detail =====
function ProjectDetail({ projectId, onBack, role }) {
  const p = getProject(projectId);
  const [tab, setTab] = useState('overview');
  if (!p) return null;
  const coord = getPerson(p.coordId);
  const milestones = MILESTONES[p.id] || [];
  const totalDeliverables = milestones.flatMap(m => m.deliverables);
  const completed = totalDeliverables.filter(d => d.status === 'concluido').length;
  const projectHours = HOURS.filter(h => h.projectId === p.id);

  const tabs = [
    { id: 'overview', label: 'Visão geral', icon: 'info' },
    { id: 'schedule', label: 'Cronograma', icon: 'calendar' },
    { id: 'hours', label: 'Horas', icon: 'clock' },
    { id: 'files', label: 'Arquivos', icon: 'paperclip', count: (FILES_BY_PROJECT[p.id] || []).length },
    { id: 'team', label: 'Equipe', icon: 'users' },
  ];

  return (
    <div className="col gap-4 fade-in">
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ alignSelf: 'flex-start' }}>
        <Icon name="arrowleft" size={14}/> Voltar para projetos
      </button>

      <div className="card">
        <div style={{ padding: 24 }}>
          <div className="row gap-2" style={{ marginBottom: 12 }}>
            <TypeBadge type={p.type} typeShort={p.type}/>
            <StatusBadge status={p.status}/>
            <span className="badge b-plan">{p.agency}</span>
          </div>
          <div className="row" style={{ alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px' }}>
              <div className="serif" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.015em', lineHeight: 1.2, marginBottom: 10 }}>{p.title}</div>
              <div className="muted" style={{ fontSize: 13.5 }}>
                Coordenado por <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{coord.titulo} {coord.name}</span>
                {' · '}Vigência {formatDate(p.start)} → {formatDate(p.end)}
              </div>
            </div>
            <div className="row gap-2">
              {role !== 'bolsista' && <button className="btn btn-outline"><Icon name="edit" size={13}/> Editar</button>}
              <button className="btn btn-outline"><Icon name="download" size={13}/> Exportar</button>
              <button className="btn btn-ghost btn-icon"><Icon name="morev" size={16}/></button>
            </div>
          </div>

          <div className="grid grid-4" style={{ marginTop: 24 }}>
            <div className="stack-sm"><span className="text-xs muted">Progresso</span><div className="serif tnum" style={{ fontSize: 22, fontWeight: 500 }}>{p.progress}%</div><Progress value={p.progress} status={p.status}/></div>
            <div className="stack-sm"><span className="text-xs muted">Valor do projeto</span><div className="serif tnum" style={{ fontSize: 22, fontWeight: 500 }}>{formatBRL(p.value)}</div><span className="text-xs muted">{p.agency} · {p.edital.split('·')[0].split(' ').slice(-2).join(' ')}</span></div>
            <div className="stack-sm"><span className="text-xs muted">Entregas</span><div className="serif tnum" style={{ fontSize: 22, fontWeight: 500 }}>{completed}/{totalDeliverables.length}</div><span className="text-xs muted">concluídas</span></div>
            <div className="stack-sm"><span className="text-xs muted">Horas registradas</span><div className="serif tnum" style={{ fontSize: 22, fontWeight: 500 }}>{projectHours.reduce((s, h) => s + h.hours, 0)}h</div><span className="text-xs muted">{projectHours.length} entradas</span></div>
          </div>
        </div>

        <div className="tabs" style={{ paddingLeft: 20 }}>
          {tabs.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              <Icon name={t.icon} size={13}/>
              {t.label}
              {t.count > 0 && <span className="badge b-plan" style={{ padding: '0 6px', fontSize: 10 }}>{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && <OverviewTab p={p}/>}
      {tab === 'schedule' && <ScheduleTab milestones={milestones} role={role}/>}
      {tab === 'hours' && <HoursTab projectHours={projectHours}/>}
      {tab === 'files' && <FilesTab files={FILES_BY_PROJECT[p.id] || []}/>}
      {tab === 'team' && <TeamTab p={p}/>}
    </div>
  );
}

function OverviewTab({ p }) {
  const coord = getPerson(p.coordId);
  return (
    <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
      <div className="col gap-4">
        <div className="card card-pad-lg">
          <div className="card-title" style={{ marginBottom: 10 }}>Sobre o projeto</div>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink-2)', margin: 0, textWrap: 'pretty' }}>{p.description}</p>
          <div className="row gap-2" style={{ marginTop: 16, flexWrap: 'wrap' }}>
            {p.tags.map(t => <span key={t} className="badge b-plan">{t}</span>)}
          </div>
        </div>

        {p.type.includes('P&D') && (
          <div className="card card-pad-lg">
            <div className="card-title" style={{ marginBottom: 14 }}>Metadados Embrapii</div>
            <div className="grid grid-3">
              <div className="stack-sm"><span className="text-xs muted">TRL atual</span><div className="serif tnum" style={{ fontSize: 22, fontWeight: 500 }}>TRL {p.trl}</div></div>
              <div className="stack-sm"><span className="text-xs muted">Contrapartida</span><div className="serif tnum" style={{ fontSize: 22, fontWeight: 500 }}>{formatBRL(p.counterpart)}</div></div>
              <div className="stack-sm"><span className="text-xs muted">Edital</span><div style={{ fontSize: 13, fontWeight: 500 }}>{p.edital}</div></div>
            </div>
          </div>
        )}

        {p.type === 'Extensão' && (
          <div className="card card-pad-lg">
            <div className="card-title" style={{ marginBottom: 14 }}>Atendimento da Extensão</div>
            <div className="stack-sm" style={{ marginBottom: 14 }}>
              <span className="text-xs muted">Público-alvo</span>
              <div style={{ fontSize: 13.5 }}>{p.publico}</div>
            </div>
            <div className="stack-sm">
              <span className="text-xs muted">Municípios atendidos</span>
              <div className="row gap-2" style={{ flexWrap: 'wrap', marginTop: 4 }}>
                {p.municipios.map(m => <span key={m} className="badge b-amber">{m}</span>)}
              </div>
            </div>
          </div>
        )}

        {p.type.includes('IC') && (
          <div className="card card-pad-lg">
            <div className="card-title" style={{ marginBottom: 14 }}>Plano de trabalho</div>
            <div className="stack-sm" style={{ marginBottom: 12 }}>
              <span className="text-xs muted">Modalidade da bolsa</span>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.bolsaTipo}</div>
            </div>
            <div className="stack-sm">
              <span className="text-xs muted">Resumo</span>
              <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{p.planoTrabalho}</div>
            </div>
          </div>
        )}
      </div>

      <div className="col gap-4">
        <div className="card card-pad-lg">
          <div className="card-title" style={{ marginBottom: 14 }}>Equipe</div>
          <div className="col gap-3">
            {p.teamIds.map(id => {
              const person = getPerson(id);
              const isCoord = id === p.coordId;
              return (
                <div key={id} className="row gap-3">
                  <Avatar name={person.name} size="lg"/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="fw-500 text-sm">{person.titulo ? `${person.titulo} ${person.name}` : person.name}</div>
                    <div className="text-xs muted">{isCoord ? 'Coordenador(a)' : person.role} · {person.dept}</div>
                  </div>
                  {isCoord && <span className="badge b-amber">PI</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card card-pad-lg">
          <div className="card-title" style={{ marginBottom: 14 }}>Fomento</div>
          <div className="col gap-3">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="text-xs muted">Agência</span>
              <span className="fw-500 text-sm">{p.agency}</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="text-xs muted">Edital</span>
              <span className="text-sm" style={{ textAlign: 'right', maxWidth: '60%' }}>{p.edital}</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="text-xs muted">Valor</span>
              <span className="fw-500 text-sm tnum">{formatBRL(p.value)}</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="text-xs muted">Vigência</span>
              <span className="text-sm tnum">{formatDateShort(p.start)} → {formatDateShort(p.end)}</span>
            </div>
          </div>
        </div>

        {p.links.length > 0 && (
          <div className="card card-pad-lg">
            <div className="card-title" style={{ marginBottom: 12 }}>Links</div>
            <div className="col gap-2">
              {p.links.map((l, i) => (
                <a key={i} href={l.url} className="row gap-2" style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--line)', fontSize: 13 }}>
                  <Icon name={l.icon === 'github' ? 'git' : l.icon === 'folder' ? 'folder' : 'file'} size={14}/>
                  <span style={{ flex: 1 }}>{l.label}</span>
                  <Icon name="link" size={12}/>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleTab({ milestones, role }) {
  const [expanded, setExpanded] = useState({});

  // Compute date range for Gantt
  const allDates = milestones.flatMap(m => [new Date(m.start), new Date(m.end)]);
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const totalDays = Math.max(1, (maxDate - minDate) / 86400000);

  // Build month axis
  const months = [];
  const cursor = new Date(minDate.getUTCFullYear(), minDate.getUTCMonth(), 1);
  while (cursor <= maxDate) {
    months.push(new Date(cursor));
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  function barStyle(start, end, status) {
    const s = ((new Date(start) - minDate) / 86400000) / totalDays * 100;
    const w = ((new Date(end) - new Date(start)) / 86400000) / totalDays * 100;
    const colorMap = { andamento: '#0F4C5C', concluido: '#10B981', atrasado: '#EF4444', planejado: '#9CA3AF' };
    return { left: `${s}%`, width: `${Math.max(w, 2)}%`, background: colorMap[status] };
  }

  return (
    <div className="col gap-4">
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div className="row gap-3">
          <div className="row gap-2 text-xs muted"><span style={{ width: 10, height: 10, borderRadius: 3, background: '#10B981' }}/>Concluído</div>
          <div className="row gap-2 text-xs muted"><span style={{ width: 10, height: 10, borderRadius: 3, background: '#0F4C5C' }}/>Em andamento</div>
          <div className="row gap-2 text-xs muted"><span style={{ width: 10, height: 10, borderRadius: 3, background: '#EF4444' }}/>Atrasado</div>
          <div className="row gap-2 text-xs muted"><span style={{ width: 10, height: 10, borderRadius: 3, background: '#9CA3AF' }}/>Planejado</div>
        </div>
        {role !== 'bolsista' && <button className="btn btn-outline btn-sm"><Icon name="plus" size={13}/> Nova meta</button>}
      </div>

      <div className="card desktop-only" style={{ overflow: 'hidden' }}>
        <div className="gantt-axis" style={{ gridTemplateColumns: `220px repeat(${months.length}, 1fr)` }}>
          <div style={{ padding: 10, background: '#FBFAF6', borderRight: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}/>
          {months.map((m, i) => (
            <div key={i} className="gantt-axis-cell">{['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][m.getUTCMonth()]} {String(m.getUTCFullYear()).slice(2)}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr' }}>
          {milestones.map(m => (
            <Fragment key={m.id}>
              <div className="gantt-cell-name">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
                  <div className="text-xs muted">{m.deliverables.length} entregas</div>
                </div>
              </div>
              <div className="gantt-cell-track">
                <div className="gantt-bar" style={barStyle(m.start, m.end, m.status)}>{m.title.split(' ').slice(0, 3).join(' ')}</div>
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      <div className="col gap-3">
        {milestones.map(m => {
          const isOpen = expanded[m.id] !== false;
          const done = m.deliverables.filter(d => d.status === 'concluido').length;
          return (
            <div key={m.id} className="card">
              <button onClick={() => setExpanded(e => ({ ...e, [m.id]: !isOpen }))} style={{ width: '100%', textAlign: 'left', padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon name={isOpen ? 'chevdown' : 'chevright'} size={14}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row gap-2" style={{ marginBottom: 4 }}>
                    <span className="fw-500 text-sm">{m.title}</span>
                    <StatusBadge status={m.status}/>
                  </div>
                  <div className="text-xs muted">{formatDateShort(m.start)} → {formatDateShort(m.end)} · {done}/{m.deliverables.length} entregas</div>
                </div>
              </button>
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--line-2)', padding: '8px 16px 14px' }}>
                  {m.deliverables.map(d => {
                    const ass = getPerson(d.assignee);
                    return (
                      <div key={d.id} className="row gap-3" style={{ padding: '10px 0', borderBottom: '1px solid var(--line-2)' }}>
                        <span style={{
                          width: 18, height: 18, borderRadius: 5,
                          border: '1.5px solid ' + (d.status === 'concluido' ? 'var(--ok)' : 'var(--line)'),
                          background: d.status === 'concluido' ? 'var(--ok)' : 'transparent',
                          display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0,
                        }}>
                          {d.status === 'concluido' && <Icon name="check" size={11} stroke={3}/>}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="text-sm fw-500" style={{ textDecoration: d.status === 'concluido' ? 'line-through' : 'none', color: d.status === 'concluido' ? 'var(--muted)' : 'var(--ink)' }}>{d.title}</div>
                          <div className="row gap-2 mt-2 text-xs muted">
                            <Avatar name={ass.name} size="sm"/>
                            {ass.name.split(' ')[0]}
                          </div>
                        </div>
                        <StatusBadge status={d.status}/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HoursTab({ projectHours }) {
  const byMember = {};
  projectHours.forEach(h => {
    const u = getPerson(h.userId);
    if (!byMember[u.id]) byMember[u.id] = { name: u.name, hours: 0 };
    byMember[u.id].hours += h.hours;
  });
  const members = Object.values(byMember);

  const byDate = {};
  projectHours.forEach(h => { byDate[h.date] = (byDate[h.date] || 0) + h.hours; });
  const series = Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).map(([d, h]) => ({ d: formatDateShort(d), h }));

  return (
    <div className="grid" style={{ gridTemplateColumns: '1fr 1.4fr' }}>
      <div className="card">
        <div className="card-head"><div className="card-title">Horas por membro</div></div>
        <div className="col" style={{ padding: 16 }}>
          {members.map(m => (
            <div key={m.name} className="row gap-3">
              <Avatar name={m.name}/>
              <div style={{ flex: 1 }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="text-sm fw-500">{m.name}</span>
                  <span className="tnum text-xs fw-600">{m.hours}h</span>
                </div>
                <Progress value={Math.min(100, m.hours * 5)} status="andamento"/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-head"><div className="card-title">Horas ao longo do tempo</div></div>
        <div style={{ padding: 16, height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EFEDE6" vertical={false}/>
              <XAxis dataKey="d" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}/>
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}/>
              <Tooltip content={<ChartTooltip/>}/>
              <Line type="monotone" dataKey="h" stroke="#0F4C5C" strokeWidth={2.5} dot={{ fill: '#E8B339', r: 4 }} name="horas"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function FilesTab({ files }) {
  if (files.length === 0) return <Empty icon="paperclip" title="Nenhum arquivo ainda" sub="Envie documentos, datasets ou apresentações relacionados ao projeto."/>;
  const iconFor = (k) => ({ pdf: 'file', doc: 'file', csv: 'grid', md: 'file', img: 'eye', ppt: 'file', zip: 'folder' })[k] || 'file';
  const colorFor = (k) => ({ pdf: '#EF4444', doc: '#0F4C5C', csv: '#10B981', md: '#6B7280', img: '#A87F3A', ppt: '#E8B339', zip: '#7D6B91' })[k] || '#6B7280';
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Arquivos do projeto</div>
        <button className="btn btn-primary btn-sm"><Icon name="upload" size={13}/> Enviar arquivo</button>
      </div>
      <div>
        {files.map(f => {
          const by = getPerson(f.by);
          return (
            <div key={f.id} className="row gap-3" style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-2)' }}>
              <span style={{ width: 36, height: 36, borderRadius: 8, background: colorFor(f.kind) + '15', color: colorFor(f.kind), display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name={iconFor(f.kind)} size={16}/>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-sm fw-500" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                <div className="text-xs muted">{f.size} · enviado por {by.name.split(' ')[0]} em {formatDateShort(f.uploaded)}</div>
              </div>
              <button className="btn btn-ghost btn-icon"><Icon name="download" size={14}/></button>
              <button className="btn btn-ghost btn-icon"><Icon name="morev" size={14}/></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamTab({ p }) {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title">Equipe e histórico</div>
        <button className="btn btn-primary btn-sm"><Icon name="plus" size={13}/> Adicionar membro</button>
      </div>
      <div>
        {p.teamIds.map(id => {
          const person = getPerson(id);
          const isCoord = id === p.coordId;
          return (
            <div key={id} className="row gap-3" style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-2)' }}>
              <Avatar name={person.name} size="lg"/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-sm fw-500">{person.titulo ? `${person.titulo} ${person.name}` : person.name}</div>
                <div className="text-xs muted">{person.email} · {person.dept}{person.curso ? ` · ${person.curso}` : ''}</div>
              </div>
              <span className="badge b-plan">{isCoord ? 'Coordenador' : 'Bolsista'}</span>
              <span className="text-xs muted tnum">desde {formatDateShort(p.start)}</span>
              <button className="btn btn-ghost btn-icon"><Icon name="morev" size={14}/></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { ProjectsList, ProjectDetail });
