// Registro de Horas, Cadastro Multi-step, Relatórios

// ===== Standalone Cronograma view (cross-project) =====
function ScheduleScreen({ role, goToProject }) {
  const projects = role === 'coord' ? PROJECTS.filter(p => p.coordId === 'u1') : role === 'bolsista' ? PROJECTS.filter(p => p.teamIds.includes('u4')) : PROJECTS;
  const allItems = projects.flatMap(p => (MILESTONES[p.id] || []).map(m => ({ ...m, projectId: p.id, projectTitle: p.title, projectType: p.typeShort })));
  const upcoming = allItems.filter(m => m.status !== 'concluido').sort((a, b) => a.end.localeCompare(b.end));

  return (
    <div className="col gap-4 fade-in">
      <div className="grid grid-3">
        <KPI label="Metas em andamento" value={allItems.filter(m => m.status === 'andamento').length} icon="target"/>
        <KPI label="Atrasadas" value={allItems.filter(m => m.status === 'atrasado').length} foot="ação necessária" footKind="down" icon="alert"/>
        <KPI label="Próximas a vencer" value={upcoming.slice(0, 5).length} foot="próximas 4 semanas" icon="calendar"/>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Próximas entregas</div>
          <select className="select" style={{ width: 'auto' }}>
            <option>Todos os projetos</option>
            {projects.map(p => <option key={p.id}>{p.title.slice(0, 40)}</option>)}
          </select>
        </div>
        <div>
          {upcoming.slice(0, 12).map(m => (
            <div key={m.id} className="row gap-3" style={{ padding: '14px 20px', borderBottom: '1px solid var(--line-2)', cursor: 'pointer' }} onClick={() => goToProject(m.projectId)}>
              <span style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--primary-tint)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon name="flag" size={15}/>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-sm fw-500">{m.title}</div>
                <div className="text-xs muted">{m.projectTitle}</div>
              </div>
              <TypeBadge type={m.projectType} typeShort={m.projectType}/>
              <StatusBadge status={m.status}/>
              <span className="text-xs muted tnum desktop-only" style={{ minWidth: 90, textAlign: 'right' }}>até {formatDate(m.end)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== Hours screen =====
function HoursScreen({ role }) {
  const today = new Date('2026-05-04');
  const [selectedDay, setSelectedDay] = useState('2026-05-04');
  const [project, setProject] = useState('p2');
  const [milestone, setMilestone] = useState('m7');
  const [hours, setHours] = useState(4);
  const [activity, setActivity] = useState('');
  const [type, setType] = useState('desenvolvimento');
  const [entries, setEntries] = useState(HOURS.filter(h => role === 'bolsista' ? h.userId === 'u4' : (role === 'coord' ? PROJECTS.filter(p => p.coordId === 'u1').some(p => p.id === h.projectId) : true)));

  const me = role === 'bolsista' ? 'u4' : null;
  const myEntries = me ? entries.filter(e => e.userId === me) : entries;
  const totalThisMonth = myEntries.reduce((s, h) => s + h.hours, 0);

  const byType = {};
  myEntries.forEach(h => { byType[h.type] = (byType[h.type] || 0) + h.hours; });
  const typeLabels = { desenvolvimento: 'Desenvolvimento', reuniao: 'Reunião', escrita: 'Escrita', pesquisa: 'Pesquisa', outros: 'Outros' };

  // Calendar
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length < 42) cells.push(null);

  const hoursByDay = {};
  myEntries.forEach(h => { hoursByDay[h.date] = (hoursByDay[h.date] || 0) + h.hours; });

  const projectsForUser = role === 'bolsista' ? PROJECTS.filter(p => p.teamIds.includes('u4')) : PROJECTS;
  const milestonesForProject = MILESTONES[project] || [];

  const submit = (e) => {
    e.preventDefault();
    if (!activity.trim()) { pushToast('Descreva a atividade', 'warn'); return; }
    const newEntry = { id: 'h' + Date.now(), userId: me || 'u4', projectId: project, date: selectedDay, hours, type, activity, approved: false };
    setEntries([newEntry, ...entries]);
    setActivity('');
    pushToast('Horas registradas com sucesso', 'ok');
  };

  const approve = (id, approved) => {
    setEntries(es => es.map(e => e.id === id ? { ...e, approved: approved } : e));
    pushToast(approved ? 'Registro aprovado' : 'Registro rejeitado', approved ? 'ok' : 'warn');
  };

  return (
    <div className="col gap-4 fade-in">
      <div className="grid grid-4">
        <KPI label="Horas no mês" value={`${totalThisMonth}h`} icon="clock"/>
        <KPI label="Aprovadas" value={`${myEntries.filter(e => e.approved).reduce((s, h) => s + h.hours, 0)}h`} footKind="up" icon="check"/>
        <KPI label="Pendentes" value={myEntries.filter(e => !e.approved).length} foot={role === 'coord' ? 'aguardando aprovação' : 'aguardando coordenador'} icon="alert"/>
        <KPI label="Tipo predominante" value={Object.entries(byType).sort((a,b)=>b[1]-a[1])[0]?.[0] ? typeLabels[Object.entries(byType).sort((a,b)=>b[1]-a[1])[0][0]] : '—'} foot={`${Object.entries(byType).sort((a,b)=>b[1]-a[1])[0]?.[1] || 0}h neste mês`} icon="chart"/>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Maio 2026</div>
            <div className="row gap-2">
              <button className="btn btn-ghost btn-icon"><Icon name="chevleft" size={14}/></button>
              <button className="btn btn-ghost btn-icon"><Icon name="chevright" size={14}/></button>
            </div>
          </div>
          <div className="cal" style={{ border: 0, borderRadius: 0 }}>
            <div className="cal-head">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="cal-grid">
              {cells.map((d, i) => {
                if (!d) return <div key={i} className="cal-day other"/>;
                const dateStr = `2026-05-${String(d).padStart(2, '0')}`;
                const h = hoursByDay[dateStr];
                const isToday = d === 4;
                const isSelected = selectedDay === dateStr;
                return (
                  <div key={i} className={`cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => setSelectedDay(dateStr)}>
                    <div className="cal-num">{d}</div>
                    {h && <div className="cal-hours tnum">{h}h</div>}
                    {h && <span className="cal-dot"/>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Registrar horas</div></div>
          <form onSubmit={submit} style={{ padding: 20 }}>
            <label className="label">Data</label>
            <input className="input" type="text" value={formatDate(selectedDay)} readOnly style={{ marginBottom: 12, background: '#FBFAF6' }}/>

            <label className="label">Projeto</label>
            <select className="select" value={project} onChange={e => setProject(e.target.value)} style={{ marginBottom: 12 }}>
              {projectsForUser.map(p => <option key={p.id} value={p.id}>{p.title.length > 50 ? p.title.slice(0, 50) + '…' : p.title}</option>)}
            </select>

            <label className="label">Meta vinculada</label>
            <select className="select" value={milestone} onChange={e => setMilestone(e.target.value)} style={{ marginBottom: 12 }}>
              {milestonesForProject.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>

            <label className="label">Horas trabalhadas: <span className="tnum fw-600" style={{ color: 'var(--primary)' }}>{hours}h</span></label>
            <input type="range" min="0.5" max="10" step="0.5" value={hours} onChange={e => setHours(parseFloat(e.target.value))} style={{ width: '100%', marginBottom: 12, accentColor: '#0F4C5C' }}/>

            <label className="label">Tipo de atividade</label>
            <select className="select" value={type} onChange={e => setType(e.target.value)} style={{ marginBottom: 12 }}>
              <option value="desenvolvimento">Desenvolvimento</option>
              <option value="reuniao">Reunião</option>
              <option value="escrita">Escrita</option>
              <option value="pesquisa">Pesquisa</option>
              <option value="outros">Outros</option>
            </select>

            <label className="label">Descrição da atividade</label>
            <textarea className="textarea input" rows="3" placeholder="Ex.: Implementação do endpoint de telemetria…" value={activity} onChange={e => setActivity(e.target.value)} style={{ marginBottom: 16, resize: 'vertical' }}/>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Icon name="plus" size={14}/> Registrar horas
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">{role === 'coord' ? 'Registros da minha equipe' : 'Últimos registros'}</div>
          {role === 'coord' && <span className="text-xs muted">{entries.filter(e => !e.approved).length} aguardando aprovação</span>}
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Data</th>
                {role === 'coord' && <th>Bolsista</th>}
                <th>Projeto</th>
                <th>Atividade</th>
                <th>Tipo</th>
                <th>Horas</th>
                <th>Status</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 12).map(e => {
                const u = getPerson(e.userId);
                const p = getProject(e.projectId);
                return (
                  <tr key={e.id}>
                    <td className="tnum text-xs">{formatDateShort(e.date)}</td>
                    {role === 'coord' && <td><span className="row gap-2"><Avatar name={u.name} size="sm"/><span className="text-xs">{u.name.split(' ')[0]}</span></span></td>}
                    <td className="text-xs" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p?.title}</td>
                    <td className="text-xs" style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.activity}</td>
                    <td><span className="badge b-plan">{typeLabels[e.type]}</span></td>
                    <td className="tnum fw-600">{e.hours}h</td>
                    <td>{e.approved ? <span className="badge b-ok"><span className="badge-dot"/>Aprovado</span> : <span className="badge b-warn"><span className="badge-dot"/>Pendente</span>}</td>
                    <td>
                      {role === 'coord' && !e.approved ? (
                        <div className="row gap-2">
                          <button className="btn btn-sm" style={{ background: 'var(--ok-tint)', color: '#047857' }} onClick={() => approve(e.id, true)}><Icon name="check" size={12}/></button>
                          <button className="btn btn-sm" style={{ background: 'var(--bad-tint)', color: '#B91C1C' }} onClick={() => approve(e.id, false)}><Icon name="x" size={12}/></button>
                        </div>
                      ) : (
                        <button className="btn btn-ghost btn-icon"><Icon name="morev" size={14}/></button>
                      )}
                    </td>
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

// ===== New Project Multi-step =====
function NewProjectScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    title: '', description: '', type: 'P&D Embrapii',
    agency: 'Embrapii', edital: '', value: 100000, start: '2026-06-01', end: '2027-12-31',
    trl: 4, counterpart: 25000, bolsaTipo: 'PIBIC (CNPq)', planoTrabalho: '',
    publico: '', municipios: '',
    coordId: 'u1', teamIds: ['u4'],
  });

  const steps = [
    { label: 'Informações básicas' },
    { label: 'Fomento' },
    { label: 'Metadados técnicos' },
    { label: 'Equipe' },
    { label: 'Revisão' },
  ];

  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  return (
    <div className="col gap-4 fade-in" style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
      <button className="btn btn-ghost btn-sm" onClick={onDone} style={{ alignSelf: 'flex-start' }}>
        <Icon name="arrowleft" size={14}/> Cancelar e voltar
      </button>

      <div className="card card-pad-lg">
        <div className="serif" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 4 }}>Cadastrar novo projeto</div>
        <div className="muted text-sm" style={{ marginBottom: 24 }}>Preencha as informações em 5 passos. Você pode salvar como rascunho a qualquer momento.</div>

        <div className="stepper">
          {steps.map((s, i) => (
            <Fragment key={i}>
              <div className={`step ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}>
                <div className="step-num">{i < step ? <Icon name="check" size={13} stroke={3}/> : i + 1}</div>
                <div className="step-label">{s.label}</div>
              </div>
              {i < steps.length - 1 && <div className={`step-connector ${i < step ? 'done' : ''}`}/>}
            </Fragment>
          ))}
        </div>

        {step === 0 && (
          <div className="col gap-4">
            <div>
              <label className="label">Título do projeto</label>
              <input className="input" value={data.title} onChange={e => set('title', e.target.value)} placeholder="Ex.: Sensoriamento ambiental aplicado a…"/>
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea className="textarea input" rows="4" value={data.description} onChange={e => set('description', e.target.value)} placeholder="Resumo executivo do projeto: motivação, objetivos e impacto esperado…"/>
            </div>
            <div>
              <label className="label">Tipo de projeto</label>
              <div className="grid grid-3" style={{ gap: 10 }}>
                {[
                  { v: 'P&D Embrapii', sub: 'Pesquisa aplicada com contrapartida industrial', icon: 'sparkle' },
                  { v: 'IC PIBIC', sub: 'Iniciação científica com bolsa CNPq/UFPA', icon: 'book' },
                  { v: 'Extensão', sub: 'Projeto de extensão universitária', icon: 'users' },
                ].map(o => (
                  <button key={o.v} type="button" className="card" style={{
                    padding: 16, textAlign: 'left', cursor: 'pointer',
                    borderColor: data.type === o.v ? 'var(--primary)' : 'var(--line)',
                    background: data.type === o.v ? 'var(--primary-tint)' : '#fff',
                    boxShadow: data.type === o.v ? '0 0 0 3px rgba(15,76,92,0.08)' : 'none',
                  }} onClick={() => set('type', o.v)}>
                    <Icon name={o.icon} size={18}/>
                    <div className="fw-500" style={{ marginTop: 8 }}>{o.v}</div>
                    <div className="text-xs muted" style={{ marginTop: 4 }}>{o.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="col gap-4">
            <div className="grid grid-2">
              <div><label className="label">Agência de fomento</label>
                <select className="select" value={data.agency} onChange={e => set('agency', e.target.value)}>
                  <option>Embrapii</option><option>CNPq</option><option>FAPESPA</option><option>CAPES</option>
                </select>
              </div>
              <div><label className="label">Edital / chamada</label>
                <input className="input" value={data.edital} onChange={e => set('edital', e.target.value)} placeholder="Ex.: Edital 02/2025…"/>
              </div>
            </div>
            <div className="grid grid-2">
              <div><label className="label">Valor (R$)</label>
                <input className="input tnum" type="number" value={data.value} onChange={e => set('value', +e.target.value)}/>
                <div className="help">{formatBRL(data.value)}</div>
              </div>
              <div><label className="label">Vigência</label>
                <div className="row gap-2">
                  <input className="input" type="date" value={data.start} onChange={e => set('start', e.target.value)}/>
                  <span className="muted">→</span>
                  <input className="input" type="date" value={data.end} onChange={e => set('end', e.target.value)}/>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="col gap-4">
            <div className="card" style={{ background: 'var(--accent-tint)', border: '1px solid #F0DBA0', padding: 14 }}>
              <div className="row gap-2">
                <Icon name="sparkle" size={16}/>
                <div>
                  <div className="fw-500 text-sm">Campos dinâmicos por tipo</div>
                  <div className="text-xs" style={{ color: '#92580A' }}>Você selecionou <strong>{data.type}</strong>. Os campos abaixo são específicos para este tipo de projeto.</div>
                </div>
              </div>
            </div>

            {data.type === 'P&D Embrapii' && (
              <Fragment>
                <div className="grid grid-2">
                  <div>
                    <label className="label">TRL atual (Technology Readiness Level)</label>
                    <input className="input tnum" type="number" min="1" max="9" value={data.trl} onChange={e => set('trl', +e.target.value)}/>
                    <div className="help">Escala TRL Embrapii: 1 (princípios básicos) → 9 (sistema operacional)</div>
                  </div>
                  <div>
                    <label className="label">Contrapartida da empresa parceira (R$)</label>
                    <input className="input tnum" type="number" value={data.counterpart} onChange={e => set('counterpart', +e.target.value)}/>
                    <div className="help">{formatBRL(data.counterpart)} ({((data.counterpart/data.value)*100).toFixed(0)}% do valor total)</div>
                  </div>
                </div>
              </Fragment>
            )}

            {data.type === 'Extensão' && (
              <Fragment>
                <div>
                  <label className="label">Público-alvo</label>
                  <input className="input" value={data.publico} onChange={e => set('publico', e.target.value)} placeholder="Ex.: Estudantes do ensino fundamental II em escolas ribeirinhas"/>
                </div>
                <div>
                  <label className="label">Municípios atendidos</label>
                  <input className="input" value={data.municipios} onChange={e => set('municipios', e.target.value)} placeholder="Separe com vírgula. Ex.: Afuá, Breves, Gurupá"/>
                  <div className="help">Use a nomenclatura oficial do IBGE.</div>
                </div>
              </Fragment>
            )}

            {data.type === 'IC PIBIC' && (
              <Fragment>
                <div>
                  <label className="label">Modalidade da bolsa</label>
                  <select className="select" value={data.bolsaTipo} onChange={e => set('bolsaTipo', e.target.value)}>
                    <option>PIBIC (CNPq)</option>
                    <option>PIBIC-Af (CNPq)</option>
                    <option>FAPESPA</option>
                    <option>PROPESP/UFPA</option>
                    <option>Voluntária</option>
                  </select>
                </div>
                <div>
                  <label className="label">Plano de trabalho do bolsista</label>
                  <textarea className="textarea input" rows="4" value={data.planoTrabalho} onChange={e => set('planoTrabalho', e.target.value)} placeholder="Descreva atividades, cronograma e produtos esperados…"/>
                </div>
              </Fragment>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="col gap-4">
            <div>
              <label className="label">Coordenador do projeto</label>
              <select className="select" value={data.coordId} onChange={e => set('coordId', e.target.value)}>
                {PEOPLE.filter(p => p.role === 'Coordenadora' || p.role === 'Coordenador').map(p => (
                  <option key={p.id} value={p.id}>{p.titulo} {p.name} — {p.dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Bolsistas iniciais ({data.teamIds.length})</label>
              <div className="card" style={{ padding: 8 }}>
                {PEOPLE.filter(p => p.role === 'Bolsista').map(p => {
                  const checked = data.teamIds.includes(p.id);
                  return (
                    <div key={p.id} className="row gap-3" style={{ padding: 8, borderRadius: 8, cursor: 'pointer' }}
                      onClick={() => set('teamIds', checked ? data.teamIds.filter(t => t !== p.id) : [...data.teamIds, p.id])}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 5,
                        border: '1.5px solid ' + (checked ? 'var(--primary)' : 'var(--line)'),
                        background: checked ? 'var(--primary)' : 'transparent',
                        display: 'grid', placeItems: 'center', color: '#fff',
                      }}>
                        {checked && <Icon name="check" size={11} stroke={3}/>}
                      </span>
                      <Avatar name={p.name}/>
                      <div style={{ flex: 1 }}>
                        <div className="fw-500 text-sm">{p.name}</div>
                        <div className="text-xs muted">{p.curso}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="col gap-4">
            <div className="card card-pad-lg" style={{ background: '#FBFAF6' }}>
              <div className="card-title" style={{ marginBottom: 16 }}>Revisão</div>
              <div className="grid grid-2 gap-6">
                <div className="stack-sm"><span className="text-xs muted">Título</span><span className="fw-500">{data.title || <em className="muted">— não informado</em>}</span></div>
                <div className="stack-sm"><span className="text-xs muted">Tipo</span><span><TypeBadge type={data.type} typeShort={data.type}/></span></div>
                <div className="stack-sm"><span className="text-xs muted">Agência / valor</span><span className="fw-500 tnum">{data.agency} · {formatBRL(data.value)}</span></div>
                <div className="stack-sm"><span className="text-xs muted">Vigência</span><span className="tnum">{formatDate(data.start)} → {formatDate(data.end)}</span></div>
                <div className="stack-sm"><span className="text-xs muted">Coordenador</span><span className="fw-500">{getPerson(data.coordId).titulo} {getPerson(data.coordId).name}</span></div>
                <div className="stack-sm"><span className="text-xs muted">Equipe</span><AvatarStack names={data.teamIds.map(id => getPerson(id).name)}/></div>
              </div>
            </div>
            <div className="text-xs muted">Ao confirmar, o projeto será criado com status "Planejado" e o coordenador receberá uma notificação para iniciar o cadastro do cronograma.</div>
          </div>
        )}

        <div className="row" style={{ justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <button className="btn btn-ghost" onClick={() => pushToast('Rascunho salvo')}>Salvar rascunho</button>
          <div className="row gap-2">
            <button className="btn btn-outline" disabled={step === 0} onClick={() => setStep(s => s - 1)} style={{ opacity: step === 0 ? 0.5 : 1 }}>
              <Icon name="arrowleft" size={13}/> Voltar
            </button>
            {step < steps.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Próximo <Icon name="arrowright" size={13}/></button>
            ) : (
              <button className="btn btn-accent" onClick={() => { pushToast('Projeto criado com sucesso!', 'ok'); onDone(); }}>
                <Icon name="check" size={14}/> Confirmar e criar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Reports =====
function ReportsScreen({ role }) {
  const [reportType, setReportType] = useState('projeto');
  const [period, setPeriod] = useState('2025-2026');

  const monthly = [
    { m: 'Jan', v: 1240 }, { m: 'Fev', v: 1480 }, { m: 'Mar', v: 1620 }, { m: 'Abr', v: 1810 },
    { m: 'Mai', v: 2040 }, { m: 'Jun', v: 1920 }, { m: 'Jul', v: 1750 }, { m: 'Ago', v: 1980 },
    { m: 'Set', v: 2210 }, { m: 'Out', v: 2380 }, { m: 'Nov', v: 2120 }, { m: 'Dez', v: 1850 },
  ];

  const byAgency = ['Embrapii', 'CNPq', 'FAPESPA', 'CAPES'].map((a, i) => ({
    name: a,
    valor: PROJECTS.filter(p => p.agency === a).reduce((s, p) => s + p.value, 0),
    projetos: PROJECTS.filter(p => p.agency === a).length,
  }));

  return (
    <div className="col gap-4 fade-in">
      <div className="card">
        <div style={{ padding: 20 }}>
          <div className="row gap-3" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="label">Tipo de relatório</label>
              <select className="select" value={reportType} onChange={e => setReportType(e.target.value)}>
                <option value="projeto">Por projeto</option>
                <option value="periodo">Por período</option>
                <option value="bolsista">Por bolsista</option>
                <option value="agencia">Por agência de fomento</option>
              </select>
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <label className="label">Período</label>
              <select className="select" value={period} onChange={e => setPeriod(e.target.value)}>
                <option>2025-2026</option>
                <option>2024-2025</option>
                <option>Últimos 12 meses</option>
                <option>Customizado…</option>
              </select>
            </div>
            <div style={{ flex: '1 1 180px' }}>
              <label className="label">Filtrar por unidade</label>
              <select className="select"><option>Todas as unidades</option><option>ICEN</option><option>ITEC</option><option>ICED</option></select>
            </div>
            <div className="row gap-2" style={{ marginLeft: 'auto' }}>
              <button className="btn btn-outline"><Icon name="download" size={14}/> CSV</button>
              <button className="btn btn-outline"><Icon name="download" size={14}/> XLSX</button>
              <button className="btn btn-primary"><Icon name="download" size={14}/> PDF</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-4">
        <KPI label="Total captado no período" value={formatBRL(PROJECTS.reduce((s, p) => s + p.value, 0))} foot="↗ 14% vs período anterior" footKind="up" icon="chart"/>
        <KPI label="Projetos no período" value={PROJECTS.length} foot={`${PROJECTS.filter(p => p.status === 'concluido').length} concluídos`} icon="folder"/>
        <KPI label="Horas registradas" value={`${HOURS.reduce((s, h) => s + h.hours, 0)}h`} foot="aprovadas e pendentes" icon="clock"/>
        <KPI label="Custo médio / projeto" value={formatBRL(Math.round(PROJECTS.reduce((s, p) => s + p.value, 0) / PROJECTS.length))} foot="incluindo bolsas" icon="target"/>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="card">
          <div className="card-head"><div className="card-title">Captação mensal — 2025</div></div>
          <div style={{ padding: 16, height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F4C5C" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#0F4C5C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFEDE6" vertical={false}/>
                <XAxis dataKey="m" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}/>
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}k`}/>
                <Tooltip content={<ChartTooltip/>}/>
                <Area type="monotone" dataKey="v" stroke="#0F4C5C" strokeWidth={2.5} fill="url(#gP)" name="R$ (mil)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div className="card-title">Distribuição por agência</div></div>
          <div style={{ padding: 16 }}>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byAgency} dataKey="valor" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {byAgency.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]}/>)}
                  </Pie>
                  <Tooltip content={<ChartTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="col gap-2" style={{ marginTop: 12 }}>
              {byAgency.map((a, i) => (
                <div key={i} className="row text-xs" style={{ justifyContent: 'space-between' }}>
                  <span className="row gap-2">
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: CHART_COLORS[i] }}/>
                    {a.name}
                  </span>
                  <span className="tnum fw-500">{formatBRL(a.valor)} <span className="muted">· {a.projetos} proj.</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head"><div className="card-title">Detalhamento dos projetos no período</div></div>
        <div style={{ overflow: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Tipo</th>
                <th>Agência</th>
                <th>Coordenador</th>
                <th>Equipe</th>
                <th>Horas</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {PROJECTS.map(p => {
                const hrs = HOURS.filter(h => h.projectId === p.id).reduce((s, h) => s + h.hours, 0);
                const coord = getPerson(p.coordId);
                return (
                  <tr key={p.id}>
                    <td style={{ maxWidth: 320 }}><div className="fw-500" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div></td>
                    <td><TypeBadge type={p.type} typeShort={p.typeShort}/></td>
                    <td className="text-xs">{p.agency}</td>
                    <td className="text-xs">{coord.name.split(' ')[0]}</td>
                    <td>{p.teamIds.length} pessoas</td>
                    <td className="tnum text-xs fw-500">{hrs}h</td>
                    <td className="tnum text-xs fw-500">{formatBRL(p.value)}</td>
                    <td><StatusBadge status={p.status}/></td>
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

Object.assign(window, { ScheduleScreen, HoursScreen, NewProjectScreen, ReportsScreen });
