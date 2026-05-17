# PesquisaHub — Progresso da implementação

Documento vivo. Atualizado a cada passo concluído. Última atualização: 2026-05-17.

## Decisões registradas

- **Banco em desenvolvimento**: MongoDB 7 via `docker-compose.yml` (porta 27017).
- **Escopo de telas**: todas as 8 do protótipo, incluindo `/cronograma` (Gantt global) e `/usuarios` (admin) — que não estão no BRIEFING mas estão no design.
- **Localização**: app no diretório raiz (`pesquisahub/`), preservando `BRIEFING.md`, `DESIGN.md`, `CLAUDE.md`, `PROGRESS.md` e `.design-ref/`.
- **Mutações**: Server Actions (não API Routes RESTful). API Routes só para reads consumidos por client components.
- **Referência visual**: `.design-ref/` contém o protótipo HTML/JSX original — usar como espelho, não copiar a estrutura interna.

---

## Fase 1 — Setup ✅ CONCLUÍDA

- [x] `npx create-next-app@latest .` — **Next.js 16.2.6** instalado (briefing pedia 15; 16 é compatível, mantém App Router; build OK)
- [x] Deps runtime: `mongoose@9.6.2 bcryptjs@3 next-auth@5-beta zod@4 react-hook-form@7 @hookform/resolvers@5 lucide-react@1.16 recharts@3.8 sonner@2`
- [x] Dev deps: `@types/bcryptjs tsx@4` (tsx para rodar o seed em TS)
- [x] `npx shadcn@latest init -d` + 11 componentes adicionados em `components/ui/`: button, card, input, label, select, dialog, tabs, table, badge, dropdown-menu, sonner
- [x] `.env.local.example` com `MONGODB_URI`, `AUTH_SECRET`, `NEXTAUTH_URL`
- [x] Tokens do design no Tailwind v4 via `@theme inline` em `app/globals.css` (paleta `#0F4C5C` / `#E8B339` / `#FAFAF7`, raios 6/10/14/20, status ok/warn/bad/plan, chart colors)
- [x] Fontes Fraunces + Inter + JetBrains Mono em `app/layout.tsx`, expostas como `--font-fraunces`, `--font-inter`, `--font-jetbrains`
- [x] `docker-compose.yml` com MongoDB 7 (user `pesquisahub`, db `pesquisahub`, volume nomeado)
- [x] Utilities `.serif` e `.tnum` + scrollbar custom em `globals.css`
- [x] Toaster (sonner) montado no root layout
- [x] Script `npm run seed` declarado no `package.json`
- [x] **Build de verificação passou** (`npm run build` ✓ TypeScript ✓ static gen em 3.2s)

**Notas/desvios da Fase 1:**
- **Next 16 em vez de Next 15**: o briefing foi escrito antes do release. App Router é idêntico, sem impacto funcional.
- **Tailwind v4 usa configuração CSS-first** (`@theme inline` em `globals.css`), não `tailwind.config.ts`. Briefing pedia `tailwind.config.ts` — substituído pelo equivalente moderno.
- **shadcn base color**: `stone` (default). As variáveis foram sobrescritas pelos tokens da paleta PesquisaHub no `globals.css`.

## Fase 2 — Banco e modelos ✅ CONCLUÍDA

- [x] `lib/db/connection.ts` com singleton Mongoose cacheado em `global.mongooseCache` (sobrevive ao hot reload do dev). Lazy: só valida `MONGODB_URI` quando `connectMongo()` é chamado, não no import — assim o build sem `.env.local` continua passando.
- [x] `types/index.ts` — enums como `const` arrays (ROLES, CATEGORIAS, TIPOS_PROJETO, STATUS_PROJETO, etc.) + tipos derivados via `(typeof X)[number]`. Plus a **união discriminada `MetadadosPrograma`** com 6 variantes (Monitoria, PET, PIAPE, PIBIC, Embrapii, Outro).
- [x] `models/Usuario.ts` — embeds: contato, endereco, dados_bancarios, academico, preferencias. `senha_hash` com `select: false` (login precisa `.select('+senha_hash')`). Índices: email único, matricula sparse+único, role.
- [x] `models/Programa.ts` — embeds: modalidades_bolsa (lista), regulamento, contato_responsavel, requisitos. Índices: sigla único, tipo+ativo.
- [x] `models/UnidadeAcademica.ts` — enxuto. Índice único em sigla.
- [x] `models/Projeto.ts` — embeds: vigencia (com prorrogações), equipe (com nome desnormalizado), cronograma (metas com entregas aninhadas, ambos com `_id` para serem alvo de referência), recursos. **`metadados_programa: Schema.Types.Mixed`** com tipo TS `MetadadosPrograma`. Índices: tipo+status, programa_id, unidade+campus, equipe.usuario_id, vigencia.fim+status, sigaa_id sparse, **2 índices sparse em metadados_programa** (unidade_demandante, semestre_letivo) — só pagam custo nos tipos que usam.
- [x] `models/RegistroHoras.ts` — coleção própria (cresce sem limite por projeto), embed aprovacao. Índices: projeto+data, usuario+data, status+projeto.
- [x] `models/Arquivo.ts` — coleção própria, embeds metadata_arquivo e vinculado_a. Índices: projeto+tipo_documento, vinculado_a.meta_id sparse.
- [x] `models/index.ts` — barrel para registrar todos os modelos numa importação só.
- [x] Comentários explicando decisões de embed/ref em cada modelo (parte da nota da disciplina).
- [x] **Type-check limpo** (`npx tsc --noEmit`) ✓
- [x] **Build limpo** (`npm run build` ✓ static gen 4/4)

**Notas:**
- Em Mongoose `Schema<T>` o tipo é o "shape" do documento sem `_id`. Para subdocs que precisam de `_id` próprio (Meta, Entrega), o `_id` está marcado `Types.ObjectId | undefined` na interface — Mongoose preenche automaticamente.
- Nenhuma string "FK" / "foreign key" no código. Comentários usam **"ref manual"**.

## Fase 3 — Validação e autenticação ✅ CONCLUÍDA

**Zod validators em `lib/validators/`** (cada um exporta tipos via `z.infer`):
- [x] `embeds.ts` — schemas reutilizáveis (Contato, Endereco, DadosBancarios, Academico, Preferencias, ModalidadeBolsa, Regulamento, ContatoResponsavel, Requisitos) + helper `objectIdString` (refine com `Types.ObjectId.isValid`)
- [x] `usuario.ts` — `loginSchema`, `usuarioCreateSchema`, `usuarioUpdateSchema`
- [x] `programa.ts` — create + update
- [x] `unidade-academica.ts` — create
- [x] `metadados-programa.ts` — 6 schemas (monitoria, PET, PIAPE, PIBIC, Embrapii, Outro com passthrough)
- [x] `projeto.ts` — **`z.discriminatedUnion("tipo", [...])`** com 6 variantes; cada uma combina projetoBase + literal do tipo + schema correto de metadados
- [x] `registro-horas.ts` — create + aprovação (com refine: status ≠ "pendente")
- [x] `arquivo.ts` — create com embeds opcionais
- [x] `index.ts` — barrel

**Auth (NextAuth v5 / Auth.js):**
- [x] `lib/auth/config.ts` — `authConfig` edge-safe: `pages.signIn=/login`, `session.strategy=jwt`, callbacks `jwt` e `session` propagando `role` e `usuario_id`. `providers: []` (preenchido na versão completa). Usa `satisfies NextAuthConfig`.
- [x] `lib/auth/index.ts` — `NextAuth({ ...authConfig, providers: [Credentials({...})] })`. Authorize: valida com `loginSchema` → `connectMongo()` → `findOne` com `.select('+senha_hash')` → `bcrypt.compare`. Retorna `{ id, email, name, role, usuario_id }`.
- [x] `lib/auth/session.ts` — helpers `getSession`, `getCurrentUser`, `requireAuth` (redirect /login), `requireRole` (redirect /dashboard se papel errado).
- [x] `types/next-auth.d.ts` — module augmentation de `Session`, `User` e `JWT` com `role: Role` e `usuario_id: string`.
- [x] `app/api/auth/[...nextauth]/route.ts` — exporta `GET` e `POST` dos handlers.

**Middleware:**
- [x] `middleware.ts` na raiz, usa `NextAuth(authConfig).auth` (importa só o config edge-safe — sem bcrypt/Mongoose, vital para o runtime edge). Lógica: redireciona não-autenticado → `/login` (com `?redirectTo`), autenticado em `/login` → `/dashboard`, e `/usuarios` exige `role===ADMIN`.

**Verificação:**
- [x] `npx tsc --noEmit` ✓
- [x] `npm run build` ✓ (rotas geradas: `/`, `/_not-found`, `/api/auth/[...nextauth]`, Proxy/Middleware detectado)

**Notas/desvios:**
- **Aviso do Next 16**: `middleware.ts` está deprecated em favor de `proxy.ts`. Funciona normalmente; vou migrar quando o resto estiver estável (anotado abaixo).
- Senha mínima = 8 chars no schema de criação. Usuários do seed serão criados respeitando isso.

## Fase 4 — Shell visual ✅ CONCLUÍDA

**Componentes compartilhados em `components/shared/`:**
- [x] `BrandMark.tsx` — quadrado `#0F4C5C` com SVG da onda + bolinha âmbar via `::after` (CSS). Exporta também `BrandLogo` com subtítulo "UFOPA · 2026/1".
- [x] `Avatar.tsx` — círculo com iniciais e cor hash-derivada da paleta (8 cores).
- [x] `StatusBadge.tsx` — pílula com dot, 4 variantes (ok/warn/bad/plan) mapeadas para os status do domínio.
- [x] `Sidebar.tsx` (client) — usa `usePathname` para active state, signOut do next-auth/react, lista filtrada por role; seção "Administração" só aparece para ADMIN.
- [x] `MobileNav.tsx` (client) — bottom-nav, mesma lógica de active state.
- [x] `UserMenu.tsx` (client) — dropdown (shadcn/base-ui) com nome, email e botão Sair.
- [x] `Topbar.tsx` (client) — usa `usePathname` + `resolvePageTitle` para mostrar título/subtítulo certo por rota; UserMenu à direita.

**Helpers:**
- [x] `lib/ui-utils.ts` — `initials`, `avatarColor` (hash), `roleLabel`, `firstAndLast`.
- [x] `lib/page-titles.ts` — mapa rota → `{title, sub(role)}` que muda conforme o papel.
- [x] `lib/seed-credentials.ts` — `QUICK_LOGIN` com 3 entradas (admin/coord/bolsista) que **serão criadas no seed (Fase 6)**.

**Layouts e páginas:**
- [x] `app/(dashboard)/layout.tsx` — server, chama `requireAuth()`, renderiza Sidebar + Topbar + content + MobileNav.
- [x] `app/(dashboard)/dashboard/page.tsx` — placeholder dando boas-vindas; dashboards reais na Fase 5.
- [x] `app/(auth)/layout.tsx` — wrapper mínimo `<main>`.
- [x] `app/(auth)/login/page.tsx` — server component: hero (gradient azul-petróleo + texto serif grande + 3 estatísticas) à esquerda + `LoginForm` à direita. No mobile (≤1023px) o hero some.
- [x] `app/(auth)/login/login-form.tsx` (client) — formulário com email+senha (Server Action `loginAction`) + 3 botões de acesso rápido (Server Action `quickLoginAction(roleKey)`). Estado `pending` via `useTransition`, erros via `toast.error`.
- [x] `app/(auth)/login/actions.ts` — Server Actions que chamam `signIn("credentials", ...)` com try/catch tratando `AuthError` (re-throw em outros casos pro Next processar o redirect).
- [x] `app/page.tsx` — substitui o welcome do create-next-app; redirect para `/dashboard` ou `/login` baseado em sessão.

**CSS:**
- [x] Classes do design adicionadas em `app/globals.css`: `.app-shell`, `.sidebar*`, `.topbar*`, `.brand-mark`, `.nav-item.active`, `.profile-switcher`, `.avatar*`, `.status-badge*`, `.bottom-nav`, `.login-wrap`, `.login-hero` (com gradient e radial decorativo).

**Verificação visual (dev server local):**
- [x] `/login` retorna 200 com a tela renderizada corretamente (HTML inspecionado, contém hero, form, 3 quick-buttons com ícones lucide)
- [x] `/dashboard` retorna 307 → `/login?redirectTo=%2Fdashboard` (middleware funcionando)
- [x] `/` retorna 307 → `/login?redirectTo=%2F` (middleware antes mesmo do redirect server-side)
- [x] Type-check ✓ e build ✓

**Notas:**
- O design tem um "ProfileSwitcher" que troca de role ao vivo (demo). No app real, eu substituí pelo `UserMenu` com botão Sair — a troca de role acontece de verdade via login na próxima sessão. A demo via 3 botões está na tela de login.
- O dropdown shadcn usa **base-ui** (não Radix). API levemente diferente: `DropdownMenuTrigger` aceita `className` direto e renderiza como `<button>` por default; **não tem `asChild`**.
- Sidebar tem botão "Configurações" placeholder (disabled) — pode virar página de preferências mais tarde.

## Fase 5 — Páginas e Server Actions ✅ CONCLUÍDA

**Camada de dados** (`lib/queries/`):
- [x] `dashboard.ts` — 6 agregações com comentários de índice: `getAdminKPIs`, `getProjetosPorTipo` ($group por tipo), `getProjetosPorStatus`, `getProjetosPorPrograma` ($group + $lookup com programas), `getUltimosProjetos`, `getProjetosDoCoordenador` (% metas via $unwind+$size+$filter), `getHorasPendentesDoCoordenador`, `getBolsistaResumo`
- [x] `projetos.ts` — `listarProjetos` (com role-gating via "equipe.usuario_id") + `getProjetoPorId` via aggregation com $lookup populando programa e unidade
- [x] `horas.ts` — `listarHoras` com role-gating (bolsista=próprias, coordenador=projetos que coordena)

**Server Actions** (`lib/actions/`):
- [x] `projetos.ts` — `criarProjeto` (valida via discriminated union + denormaliza nome do membro) + `atualizarStatusEntrega` (update aninhado com $[] arrayFilters)
- [x] `horas.ts` — `registrarHoras` (auto status=pendente) + `aprovarRejeitarHoras` (verifica que coord é dono do projeto)

**Componentes**:
- [x] `KPI.tsx` — card serif com valor grande tnum, ícone, footer up/down
- [x] `Charts.tsx` (client) — `BarChartCard` e `PieChartCard` com tooltip custom + paleta CHART_COLORS

**Dashboards por role** (`components/dashboard/`):
- [x] `DashboardAdmin.tsx` — 4 KPIs + bar chart (por programa) + pie (por tipo) + tabela últimos 8
- [x] `DashboardCoordenador.tsx` — 4 KPIs + cards de meus projetos (com progress bar de metas) + pendências
- [x] `DashboardBolsista.tsx` — 4 KPIs + card gradient com tarefas + lista de entregas

**Páginas**:
- [x] `/dashboard` — dispatcher por role
- [x] `/projetos` — lista com filtros (tipo, status, busca) via searchParams + tabela responsiva
- [x] `/projetos/[id]` — header + 5 abas em `_tabs/`: overview, cronograma, horas, arquivos, equipe
- [x] `/projetos/[id]/_tabs/cronograma.tsx` + `entrega-toggle.tsx` (client) — toggle de status de entrega via Server Action
- [x] `/projetos/novo` — server component carrega listas, passa para `NovoProjetoForm` (client)
- [x] `/projetos/novo/novo-form.tsx` — **multi-step 5 passos** com stepper, validação de avanço, submit via Server Action
- [x] `/projetos/novo/metadados-fields.tsx` — **DESTAQUE DA DEMO**: 6 implementações distintas (MonitoriaFields, PetFields, PiapeFields, PibicFields, EmbrapiiFields, OutroFields). Mudar o `tipo` no passo 1 troca completamente os campos no passo 3. Caso OUTRO tem aviso explicando passthrough/Mixed.
- [x] `/cronograma` — pipeline `$unwind` em cronograma agrupa metas por mês
- [x] `/horas` — split em registrar + lista; coord vê botões aprovar/rejeitar
- [x] `/relatorios` — 3 cards de export (placeholders disabled) + 3 charts agregados
- [x] `/usuarios` — tabela admin com avatares, contagem de projetos por usuário ($unwind equipe)

**Verificação:**
- [x] Type-check ✓ `npx tsc --noEmit`
- [x] Build ✓ **11 rotas geradas**: `/`, `/_not-found`, `/api/auth/[...nextauth]`, `/cronograma`, `/dashboard`, `/horas`, `/login`, `/projetos`, `/projetos/[id]`, `/projetos/novo`, `/relatorios`, `/usuarios`

**Notas:**
- Páginas só vão **mostrar dados de verdade após Fase 6 (seed)** — por enquanto retornam tudo vazio com empty states amigáveis.
- Cada agregação tem um comentário "Aproveita: { ... }" indicando o índice que está sendo usado (parte da nota da disciplina).
- `metadados_programa` no banco é Mixed; nas tabs/dashboards é tipado como `Record<string, unknown>` para preservar a flexibilidade.

## Fase 6 — Seed ✅ CONCLUÍDA

- [x] `scripts/seed.ts` — script idempotente que limpa as 6 coleções e popula:
  - **3 unidades académicas** (ICED, IBEF, ICTA — todas Tapajós)
  - **5 programas** com embeds completos (modalidades_bolsa, regulamento, contato_responsavel, requisitos): MON, PET-COMP, PIAPE, PIBIC, EMBRAPII
  - **8 usuários** com senhas bcrypt (single password `pesquisahub2026` para demo): 1 ADMIN + 3 COORDENADOR + 4 BOLSISTA. Embeds `contato`, `endereco`, `academico` (lattes/orcid quando aplicável) e `preferencias` preenchidos. Credenciais de demo alinhadas com `lib/seed-credentials.ts`.
  - **6 projetos** cobrindo todos os tipos (MONITORIA, PET, PIAPE, PIBIC, PD_EMBRAPII, OUTRO). Cada um com cronograma realista (3-4 metas com entregas), equipe (coord + bolsistas), `metadados_programa` específico do tipo, e recursos. O projeto EMBRAPII tem prorrogação registrada e marcos contratuais.
  - **25 registros de horas** distribuídos entre os bolsistas, mistura aprovados e pendentes (com objeto `aprovacao` preenchido nos aprovados)
  - **5 arquivos** com `metadata_arquivo` (hash, versão) e `tipo_documento` variados
- [x] `npm run seed` usa `tsx --env-file=.env.local` (Node ≥ 20.6 + tsx 4.7+ suportam o flag, evita dependência extra de dotenv)
- [x] **Seed executado com sucesso** contra MongoDB rodando via `docker compose up -d`. Sem warnings de Mongoose (índices duplicados removidos em Usuario/Programa/UnidadeAcademica — `unique: true` já no field declaration cobria).
- [x] **Login programático testado**: CSRF → POST `/api/auth/callback/credentials` (admin@ufopa.edu.br + pesquisahub2026) → sessão estabelecida → GET `/dashboard` retorna 200 com **dados reais**: 6 projetos totais, 4 bolsistas distintos via agregação `$unwind`+`$group`.

**Notas:**
- Fix de bug colateral: removidos `schema.index({ ... unique: true })` redundantes em 3 modelos onde o campo já tinha `unique: true` na declaração — eliminou warnings do Mongoose 9.
- Senha única `pesquisahub2026` para todos os usuários do seed simplifica a demo. Em produção real seria por usuário.

## Fase 7 — Polish

- [ ] README com setup local + Docker + credenciais de seed + nota sobre "ref manual"
- [ ] Empty states em listagens
- [ ] Loading states
- [ ] Responsividade 375px e 1280px

---

## Pendências / dúvidas em aberto

- **Migrar `middleware.ts` → `proxy.ts`** (Next 16 deprecou o nome). Sem urgência; fazer ao final do projeto pra evitar mexer enquanto NextAuth ainda está sendo testado.

## Histórico de alterações

- **2026-05-17** — Documento criado. Plano confirmado com o usuário. Iniciando Fase 1.
- **2026-05-17** — Fase 1 concluída. Next 16.2.6 + Tailwind v4 + shadcn instalados, fontes carregadas, tokens do design aplicados, build de verificação passou. Pausando para validação antes da Fase 2.
- **2026-05-17** — Repositório sincronizado com `https://github.com/elian-sss/pesquisahub.git`. Branch renomeada `master` → `main`. Commit da Fase 1 + commit inicial do create-next-app pushados. Política registrada em CLAUDE.md, BRIEFING.md e na memory: **nunca** adicionar footer `Co-Authored-By: Claude` em commits; pushes vão direto para `main` (sem PR).
- **2026-05-17** — Fase 2 concluída. 6 modelos Mongoose escritos com embeds, índices (incluindo sparse) e comentários de decisão. Singleton de conexão lazy. Tipo `MetadadosPrograma` como união discriminada por tipo de projeto. Type-check e build passaram.
- **2026-05-17** — Fase 3 concluída. Zod validators (com `z.discriminatedUnion` em `projeto.ts`), NextAuth v5 split em config edge-safe + setup completo, helpers de sessão (`requireAuth`, `requireRole`), module augmentation de `Session/User/JWT`, route handler em `app/api/auth/[...nextauth]/route.ts`, middleware com proteção por role (ADMIN para `/usuarios`).
- **2026-05-17** — Fase 4 concluída. Shell visual: Sidebar + Topbar + MobileNav + UserMenu + Avatar + StatusBadge + BrandMark. Tela de login (hero + form + 3 quick-access buttons) com Server Actions. Layout do dashboard protegido via `requireAuth`. Verificação visual: `/login` 200, `/dashboard` 307→login, `/` 307→login. Dev server testado, type-check ✓, build ✓.
- **2026-05-17** — Fase 5 concluída. 8 páginas + 5 abas de detalhe + 3 dashboards por role + cadastro multi-step com `MetadadosProgramaFields` (6 variantes por tipo de projeto — o destaque da demo). Camada de queries com 6 agregações MongoDB comentando os índices que cada uma aproveita. Server Actions para criar projeto, marcar entrega concluída, registrar/aprovar horas. Build com 11 rotas. Próximo passo: seed para popular o banco e testar visualmente.
- **2026-05-17** — Fase 6 concluída. `scripts/seed.ts` popula 6 coleções com dados realistas da UFOPA (3 unidades, 5 programas, 8 usuários com bcrypt, 6 projetos cobrindo todos os tipos, 25 horas, 5 arquivos). Removidos índices duplicados em 3 modelos. **Login testado via curl**: admin@ufopa.edu.br → dashboard retorna dados reais (6 projetos, 4 bolsistas distintos). MongoDB rodando via `docker compose`.
