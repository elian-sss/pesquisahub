// PesquisaHub mock data layer
// Realistic Brazilian academic research project data

const PEOPLE = [
  { id: 'u1', name: 'Maria Silva', role: 'Coordenadora', email: 'maria.silva@uni.edu.br', dept: 'Engenharia Elétrica', titulo: 'Profa. Dra.' },
  { id: 'u2', name: 'Carlos Mendes', role: 'Coordenador', email: 'carlos.mendes@uni.edu.br', dept: 'Computação', titulo: 'Prof. Dr.' },
  { id: 'u3', name: 'Ana Beatriz Costa', role: 'Coordenadora', email: 'ana.costa@uni.edu.br', dept: 'Educação', titulo: 'Profa. Dra.' },
  { id: 'u4', name: 'João Pereira', role: 'Bolsista', email: 'joao.pereira@aluno.uni.edu.br', dept: 'Computação', curso: 'Eng. de Computação · 6º sem' },
  { id: 'u5', name: 'Larissa Oliveira', role: 'Bolsista', email: 'larissa.oliveira@aluno.uni.edu.br', dept: 'Engenharia Elétrica', curso: 'Eng. Elétrica · 8º sem' },
  { id: 'u6', name: 'Rafael Santos', role: 'Bolsista', email: 'rafael.santos@aluno.uni.edu.br', dept: 'Computação', curso: 'Ciência da Comp. · 5º sem' },
  { id: 'u7', name: 'Juliana Rocha', role: 'Bolsista', email: 'juliana.rocha@aluno.uni.edu.br', dept: 'Educação', curso: 'Pedagogia · 7º sem' },
  { id: 'u8', name: 'Pedro Almeida', role: 'Bolsista', email: 'pedro.almeida@aluno.uni.edu.br', dept: 'Engenharia Elétrica', curso: 'Eng. Mecatrônica · 6º sem' },
  { id: 'u0', name: 'Beatriz Souza', role: 'Admin', email: 'admin@uni.edu.br', dept: 'Pró-Reitoria de Pesquisa', titulo: 'PROPESP' },
];

const PROJECTS = [
  {
    id: 'p1',
    title: 'Sensor IoT para monitoramento de qualidade da água em rios amazônicos',
    type: 'P&D Embrapii',
    typeShort: 'P&D',
    status: 'andamento',
    progress: 65,
    coordId: 'u1',
    teamIds: ['u1', 'u5', 'u8'],
    agency: 'Embrapii',
    edital: 'Edital Embrapii Sustentabilidade 02/2024',
    value: 248000,
    counterpart: 62000,
    trl: 4,
    start: '2024-08-15',
    end: '2026-02-28',
    description: 'Desenvolvimento de uma rede de sensores de baixo custo para medição contínua de turbidez, pH, oxigênio dissolvido e temperatura em afluentes da bacia amazônica. O projeto integra hardware open-source, conectividade LoRaWAN e uma plataforma de visualização em tempo real para órgãos ambientais e comunidades ribeirinhas.',
    tags: ['IoT', 'LoRaWAN', 'Sustentabilidade', 'Sensoriamento'],
    links: [
      { label: 'Repositório Git', url: '#', icon: 'github' },
      { label: 'Drive do projeto', url: '#', icon: 'folder' },
    ],
  },
  {
    id: 'p2',
    title: 'Análise de algoritmos de roteamento em redes mesh comunitárias',
    type: 'IC PIBIC',
    typeShort: 'IC',
    status: 'andamento',
    progress: 40,
    coordId: 'u2',
    teamIds: ['u2', 'u4'],
    agency: 'CNPq',
    edital: 'PIBIC 2025/2026',
    value: 7200,
    bolsaTipo: 'PIBIC (CNPq)',
    planoTrabalho: 'Caracterização empírica de protocolos BATMAN-adv, OLSR e Babel em testbed de 12 nós Raspberry Pi.',
    start: '2025-08-01',
    end: '2026-07-31',
    description: 'Estudo comparativo de desempenho, latência e overhead de protocolos de roteamento em redes mesh sem fio aplicadas a contextos comunitários e de baixa infraestrutura.',
    tags: ['Redes', 'Mesh', 'Roteamento', 'IC'],
    links: [{ label: 'Repositório Git', url: '#', icon: 'github' }],
  },
  {
    id: 'p3',
    title: 'Plataforma educacional para escolas ribeirinhas',
    type: 'Extensão',
    typeShort: 'EXT',
    status: 'atrasado',
    progress: 30,
    coordId: 'u3',
    teamIds: ['u3', 'u7', 'u4'],
    agency: 'CAPES',
    edital: 'PROEX 2025 — Inclusão Digital',
    value: 86000,
    publico: 'Estudantes do ensino fundamental II em escolas ribeirinhas (200 alunos diretos)',
    municipios: ['Afuá', 'Breves', 'Gurupá', 'Anajás'],
    start: '2025-03-01',
    end: '2026-06-30',
    description: 'Plataforma offline-first com conteúdo curricular adaptado, materiais interativos e ferramentas de avaliação para escolas com conectividade intermitente. Implantação piloto em quatro municípios do arquipélago do Marajó.',
    tags: ['Extensão', 'Educação', 'Offline-first', 'Marajó'],
    links: [{ label: 'Drive do projeto', url: '#', icon: 'folder' }],
  },
  {
    id: 'p4',
    title: 'Sistema de visão computacional para inspeção agrícola',
    type: 'P&D Embrapii',
    typeShort: 'P&D',
    status: 'concluido',
    progress: 100,
    coordId: 'u2',
    teamIds: ['u2', 'u6', 'u4'],
    agency: 'Embrapii',
    edital: 'Embrapii Agro Digital 01/2023',
    value: 195000,
    counterpart: 48750,
    trl: 6,
    start: '2024-01-10',
    end: '2025-12-15',
    description: 'Sistema embarcado de visão computacional para detecção precoce de pragas em culturas de açaí e cacau. Integra modelos de deep learning otimizados para edge computing e foi validado em três cooperativas parceiras.',
    tags: ['Visão computacional', 'Agro', 'Edge AI', 'Concluído'],
    links: [
      { label: 'Repositório Git', url: '#', icon: 'github' },
      { label: 'Artigo publicado', url: '#', icon: 'file' },
    ],
  },
  {
    id: 'p5',
    title: 'Otimização de consumo energético em edifícios públicos',
    type: 'IC FAPESPA',
    typeShort: 'IC',
    status: 'andamento',
    progress: 75,
    coordId: 'u1',
    teamIds: ['u1', 'u5'],
    agency: 'FAPESPA',
    edital: 'FAPESPA Jovem Pesquisador 2024',
    value: 9600,
    bolsaTipo: 'FAPESPA',
    planoTrabalho: 'Modelagem termo-energética e proposição de retrofit em prédios administrativos da universidade.',
    start: '2024-11-01',
    end: '2026-04-30',
    description: 'Estudo de consumo energético em edificações públicas e proposição de medidas de retrofit com base em simulação termoenergética e análise de viabilidade.',
    tags: ['Energia', 'Edificações', 'Sustentabilidade'],
    links: [],
  },
];

const MILESTONES = {
  p1: [
    { id: 'm1', title: 'Especificação dos sensores e prova de conceito', start: '2024-08-15', end: '2024-12-15', status: 'concluido', deliverables: [
      { id: 'd1', title: 'Documento de especificação técnica', assignee: 'u5', status: 'concluido' },
      { id: 'd2', title: 'PoC com sensor de turbidez', assignee: 'u8', status: 'concluido' },
    ]},
    { id: 'm2', title: 'Desenvolvimento do firmware embarcado', start: '2024-12-16', end: '2025-05-30', status: 'concluido', deliverables: [
      { id: 'd3', title: 'Firmware v1.0 + integração LoRa', assignee: 'u8', status: 'concluido' },
      { id: 'd4', title: 'Bateria de testes em laboratório', assignee: 'u5', status: 'concluido' },
    ]},
    { id: 'm3', title: 'Plataforma web e dashboard de telemetria', start: '2025-04-01', end: '2025-09-30', status: 'andamento', deliverables: [
      { id: 'd5', title: 'API de ingestão de dados', assignee: 'u5', status: 'concluido' },
      { id: 'd6', title: 'Dashboard público para monitoramento', assignee: 'u8', status: 'andamento' },
      { id: 'd7', title: 'Sistema de alertas por SMS/Telegram', assignee: 'u5', status: 'planejado' },
    ]},
    { id: 'm4', title: 'Implantação piloto em 3 comunidades', start: '2025-10-01', end: '2026-01-31', status: 'planejado', deliverables: [
      { id: 'd8', title: 'Logística e capacitação local', assignee: 'u8', status: 'planejado' },
      { id: 'd9', title: 'Coleta de dados em campo (90 dias)', assignee: 'u5', status: 'planejado' },
    ]},
    { id: 'm5', title: 'Relatório final e disseminação', start: '2026-02-01', end: '2026-02-28', status: 'planejado', deliverables: [
      { id: 'd10', title: 'Relatório técnico Embrapii', assignee: 'u1', status: 'planejado' },
      { id: 'd11', title: 'Submissão de artigo SBRC', assignee: 'u5', status: 'planejado' },
    ]},
  ],
  p2: [
    { id: 'm6', title: 'Revisão sistemática da literatura', start: '2025-08-01', end: '2025-10-15', status: 'concluido', deliverables: [
      { id: 'd12', title: 'Mapeamento de protocolos mesh', assignee: 'u4', status: 'concluido' },
    ]},
    { id: 'm7', title: 'Configuração do testbed de 12 nós', start: '2025-10-16', end: '2026-01-31', status: 'andamento', deliverables: [
      { id: 'd13', title: 'Provisionamento dos Raspberry Pi', assignee: 'u4', status: 'concluido' },
      { id: 'd14', title: 'Automação com Ansible', assignee: 'u4', status: 'andamento' },
      { id: 'd15', title: 'Cenários de teste documentados', assignee: 'u4', status: 'planejado' },
    ]},
    { id: 'm8', title: 'Coleta e análise de métricas', start: '2026-02-01', end: '2026-05-31', status: 'planejado', deliverables: [
      { id: 'd16', title: 'Scripts de telemetria', assignee: 'u4', status: 'planejado' },
    ]},
    { id: 'm9', title: 'Redação do relatório final', start: '2026-06-01', end: '2026-07-31', status: 'planejado', deliverables: [
      { id: 'd17', title: 'Relatório PIBIC', assignee: 'u4', status: 'planejado' },
    ]},
  ],
  p3: [
    { id: 'm10', title: 'Mapeamento das comunidades parceiras', start: '2025-03-01', end: '2025-05-30', status: 'concluido', deliverables: [
      { id: 'd18', title: 'Diagnóstico nas 4 escolas', assignee: 'u7', status: 'concluido' },
    ]},
    { id: 'm11', title: 'Curadoria de conteúdo curricular', start: '2025-06-01', end: '2025-09-30', status: 'andamento', deliverables: [
      { id: 'd19', title: 'Trilhas de aprendizagem (6º ao 9º ano)', assignee: 'u7', status: 'andamento' },
      { id: 'd20', title: 'Material de avaliação', assignee: 'u7', status: 'planejado' },
    ]},
    { id: 'm12', title: 'Desenvolvimento da plataforma offline', start: '2025-08-01', end: '2026-01-31', status: 'atrasado', deliverables: [
      { id: 'd21', title: 'App mobile (Android)', assignee: 'u4', status: 'atrasado' },
      { id: 'd22', title: 'Sincronização P2P entre dispositivos', assignee: 'u4', status: 'planejado' },
    ]},
    { id: 'm13', title: 'Implantação piloto', start: '2026-02-01', end: '2026-06-30', status: 'planejado', deliverables: [
      { id: 'd23', title: 'Capacitação de professores', assignee: 'u7', status: 'planejado' },
    ]},
  ],
  p4: [
    { id: 'm14', title: 'Coleta de dataset', start: '2024-01-10', end: '2024-05-30', status: 'concluido', deliverables: [{ id: 'd24', title: '20k imagens anotadas', assignee: 'u6', status: 'concluido' }]},
    { id: 'm15', title: 'Treinamento dos modelos', start: '2024-06-01', end: '2024-12-31', status: 'concluido', deliverables: [{ id: 'd25', title: 'Modelo YOLO otimizado', assignee: 'u6', status: 'concluido' }]},
    { id: 'm16', title: 'Validação em campo', start: '2025-01-01', end: '2025-08-31', status: 'concluido', deliverables: [{ id: 'd26', title: 'Relatório de validação', assignee: 'u4', status: 'concluido' }]},
    { id: 'm17', title: 'Transferência tecnológica', start: '2025-09-01', end: '2025-12-15', status: 'concluido', deliverables: [{ id: 'd27', title: 'Documentação para parceiros', assignee: 'u2', status: 'concluido' }]},
  ],
  p5: [
    { id: 'm18', title: 'Auditoria energética dos prédios', start: '2024-11-01', end: '2025-04-30', status: 'concluido', deliverables: [{ id: 'd28', title: 'Levantamento de cargas', assignee: 'u5', status: 'concluido' }]},
    { id: 'm19', title: 'Modelagem termo-energética', start: '2025-05-01', end: '2025-12-31', status: 'concluido', deliverables: [{ id: 'd29', title: 'Modelos EnergyPlus', assignee: 'u5', status: 'concluido' }]},
    { id: 'm20', title: 'Proposta de retrofit', start: '2026-01-01', end: '2026-04-30', status: 'andamento', deliverables: [
      { id: 'd30', title: 'Análise de viabilidade econômica', assignee: 'u5', status: 'andamento' },
      { id: 'd31', title: 'Especificação dos retrofits', assignee: 'u1', status: 'planejado' },
    ]},
  ],
};

// Hour entries — last 30 days, varied
const HOURS = [
  { id: 'h1', userId: 'u4', projectId: 'p2', date: '2026-04-28', hours: 4, type: 'desenvolvimento', activity: 'Configuração do Ansible para os nós do testbed', approved: true },
  { id: 'h2', userId: 'u4', projectId: 'p2', date: '2026-04-29', hours: 3, type: 'pesquisa', activity: 'Leitura de papers sobre BATMAN-adv', approved: true },
  { id: 'h3', userId: 'u4', projectId: 'p2', date: '2026-04-30', hours: 5, type: 'desenvolvimento', activity: 'Scripts de provisionamento + ajustes na imagem base', approved: true },
  { id: 'h4', userId: 'u4', projectId: 'p2', date: '2026-05-01', hours: 2, type: 'reuniao', activity: 'Reunião semanal com Prof. Carlos', approved: false },
  { id: 'h5', userId: 'u4', projectId: 'p2', date: '2026-05-02', hours: 4.5, type: 'desenvolvimento', activity: 'Debug da automação Ansible — hosts não conectavam', approved: false },
  { id: 'h6', userId: 'u4', projectId: 'p2', date: '2026-05-03', hours: 3, type: 'escrita', activity: 'Atualização da documentação no wiki', approved: false },
  { id: 'h7', userId: 'u5', projectId: 'p1', date: '2026-04-29', hours: 6, type: 'desenvolvimento', activity: 'Implementação do endpoint de ingestão batch', approved: true },
  { id: 'h8', userId: 'u5', projectId: 'p1', date: '2026-04-30', hours: 3, type: 'reuniao', activity: 'Sincronização com equipe de hardware', approved: true },
  { id: 'h9', userId: 'u5', projectId: 'p5', date: '2026-05-01', hours: 4, type: 'pesquisa', activity: 'Simulações no EnergyPlus — bloco administrativo', approved: false },
  { id: 'h10', userId: 'u8', projectId: 'p1', date: '2026-04-28', hours: 5, type: 'desenvolvimento', activity: 'Frontend do dashboard — mapa de sensores', approved: true },
  { id: 'h11', userId: 'u8', projectId: 'p1', date: '2026-05-02', hours: 4, type: 'desenvolvimento', activity: 'Ajustes responsivos no dashboard', approved: false },
  { id: 'h12', userId: 'u7', projectId: 'p3', date: '2026-04-30', hours: 6, type: 'escrita', activity: 'Trilha de matemática — 7º ano', approved: false },
  { id: 'h13', userId: 'u7', projectId: 'p3', date: '2026-05-02', hours: 4, type: 'pesquisa', activity: 'Curadoria de recursos abertos (Khan, OBA)', approved: false },
];

const FILES_BY_PROJECT = {
  p1: [
    { id: 'f1', name: 'Especificação técnica v3.pdf', size: '2.4 MB', uploaded: '2024-12-10', by: 'u5', kind: 'pdf' },
    { id: 'f2', name: 'Esquemático eletrônico — sensor v2.pdf', size: '1.1 MB', uploaded: '2025-01-22', by: 'u8', kind: 'pdf' },
    { id: 'f3', name: 'Relatório semestral Embrapii.docx', size: '684 KB', uploaded: '2025-08-15', by: 'u1', kind: 'doc' },
    { id: 'f4', name: 'Dataset preliminar — 90 dias.csv', size: '12 MB', uploaded: '2025-09-02', by: 'u5', kind: 'csv' },
    { id: 'f5', name: 'Apresentação banca Embrapii.pptx', size: '8.2 MB', uploaded: '2025-10-30', by: 'u1', kind: 'ppt' },
  ],
  p2: [
    { id: 'f6', name: 'Plano de trabalho PIBIC.pdf', size: '420 KB', uploaded: '2025-08-05', by: 'u2', kind: 'pdf' },
    { id: 'f7', name: 'Notas de revisão sistemática.md', size: '38 KB', uploaded: '2025-10-01', by: 'u4', kind: 'md' },
    { id: 'f8', name: 'topologia-testbed.png', size: '180 KB', uploaded: '2025-11-12', by: 'u4', kind: 'img' },
  ],
  p3: [
    { id: 'f9', name: 'Diagnóstico — escolas Marajó.pdf', size: '4.1 MB', uploaded: '2025-06-02', by: 'u7', kind: 'pdf' },
    { id: 'f10', name: 'Plano pedagógico v2.docx', size: '892 KB', uploaded: '2025-09-12', by: 'u3', kind: 'doc' },
  ],
  p4: [
    { id: 'f11', name: 'Modelo YOLOv8 final.zip', size: '142 MB', uploaded: '2025-08-18', by: 'u6', kind: 'zip' },
    { id: 'f12', name: 'Artigo SBRC 2025 — submissão.pdf', size: '1.6 MB', uploaded: '2025-11-04', by: 'u2', kind: 'pdf' },
  ],
  p5: [
    { id: 'f13', name: 'Auditoria energética — bloco A.pdf', size: '3.2 MB', uploaded: '2025-04-22', by: 'u5', kind: 'pdf' },
  ],
};

const NOTIFICATIONS = [
  { id: 'n1', text: 'Larissa Oliveira registrou 6h em "Sensor IoT"', time: '2 min', kind: 'hours' },
  { id: 'n2', text: '"Plataforma educacional" está atrasado em 2 dias', time: '1h', kind: 'warn' },
  { id: 'n3', text: 'Nova entrega atribuída: Dashboard público', time: '3h', kind: 'task' },
  { id: 'n4', text: 'Vigência de "Sensor IoT" termina em 60 dias', time: 'ontem', kind: 'warn' },
];

// Helpers
function getPerson(id) { return PEOPLE.find(p => p.id === id); }
function getProject(id) { return PROJECTS.find(p => p.id === id); }
function avatarColor(name) {
  // Hash-based deterministic color selection from a palette
  const palette = ['#0F4C5C', '#5B7C7E', '#3B6E6F', '#856B3D', '#A87F3A', '#5D4E60', '#7D6B91', '#3F5A6B', '#6B7B8C', '#8C5B5B'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}
function initials(name) {
  return name.split(/\s+/).slice(0, 2).map(s => s[0] || '').join('').toUpperCase();
}
function formatBRL(n) {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function formatDate(iso) {
  const d = new Date(iso);
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
function formatDateShort(iso) {
  const d = new Date(iso);
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]}`;
}
function statusLabel(s) {
  return ({ andamento: 'Em andamento', concluido: 'Concluído', atrasado: 'Atrasado', planejado: 'Planejado' })[s] || s;
}
function statusBadgeClass(s) {
  return ({ andamento: 'b-warn', concluido: 'b-ok', atrasado: 'b-bad', planejado: 'b-plan' })[s] || 'b-plan';
}
function progressClass(p, status) {
  if (status === 'atrasado') return 'bad';
  if (status === 'concluido') return 'ok';
  if (p >= 70) return 'ok';
  if (p >= 35) return 'warn';
  return 'primary';
}

Object.assign(window, {
  PEOPLE, PROJECTS, MILESTONES, HOURS, FILES_BY_PROJECT, NOTIFICATIONS,
  getPerson, getProject, avatarColor, initials, formatBRL, formatDate, formatDateShort,
  statusLabel, statusBadgeClass, progressClass,
});
