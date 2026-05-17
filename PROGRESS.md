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

## Fase 3 — Validação e autenticação

- [ ] `lib/validators/usuario.ts`, `programa.ts`, `projeto.ts`, etc. (Zod)
- [ ] `lib/validators/metadados-programa.ts` — **discriminated union** por tipo
- [ ] `lib/auth/config.ts` — NextAuth v5 Credentials + bcrypt + JWT
- [ ] `lib/auth/session.ts` — helpers de sessão tipados
- [ ] `middleware.ts` — proteção de rotas por role

## Fase 4 — Shell visual

- [ ] `(dashboard)/layout.tsx` — Sidebar + Topbar + MobileNav
- [ ] `components/shared/Sidebar.tsx` (com logo marca quadrada `#0F4C5C` + bolinha âmbar)
- [ ] `components/shared/Topbar.tsx` (com avatar, nome, role, logout)
- [ ] `components/shared/BottomNav.tsx` (mobile)
- [ ] `components/shared/StatusBadge.tsx`
- [ ] `components/shared/Avatar.tsx`
- [ ] `(auth)/login/page.tsx` (com 3 botões de acesso rápido)

## Fase 5 — Páginas e Server Actions

- [ ] `/dashboard` — server component que despacha por role
- [ ] `components/dashboard/DashboardAdmin.tsx` (agregações `$group` por status/tipo/programa)
- [ ] `components/dashboard/DashboardCoordenador.tsx` (% metas concluídas via `$unwind`+`$group`)
- [ ] `components/dashboard/DashboardBolsista.tsx` (tarefas, horas do mês)
- [ ] `/projetos` — lista com filtros via search params
- [ ] `/projetos/[id]` — abas: Visão Geral, Cronograma, Horas, Arquivos, Equipe
- [ ] `/projetos/novo` — multi-step com `MetadadosProgramaFields` (destaque da apresentação)
- [ ] `/cronograma` — Gantt global (extra do design)
- [ ] `/horas` — registro + aprovação
- [ ] `/relatorios` — UI com dados mockados/agregação simples
- [ ] `/usuarios` — tabela admin (extra do design)
- [ ] Server Actions para mutações em `app/_actions/`
- [ ] Toasts via sonner

## Fase 6 — Seed

- [ ] `scripts/seed.ts` — 3 unidades, 5 programas, 8 usuários, 6 projetos, 20-30 registros de horas, 4-5 arquivos
- [ ] Senhas hashadas + embeds preenchidos (contato, endereco, academico, preferencias)
- [ ] Script `npm run seed` no `package.json`

## Fase 7 — Polish

- [ ] README com setup local + Docker + credenciais de seed + nota sobre "ref manual"
- [ ] Empty states em listagens
- [ ] Loading states
- [ ] Responsividade 375px e 1280px

---

## Pendências / dúvidas em aberto

(nada por enquanto)

## Histórico de alterações

- **2026-05-17** — Documento criado. Plano confirmado com o usuário. Iniciando Fase 1.
- **2026-05-17** — Fase 1 concluída. Next 16.2.6 + Tailwind v4 + shadcn instalados, fontes carregadas, tokens do design aplicados, build de verificação passou. Pausando para validação antes da Fase 2.
- **2026-05-17** — Repositório sincronizado com `https://github.com/elian-sss/pesquisahub.git`. Branch renomeada `master` → `main`. Commit da Fase 1 + commit inicial do create-next-app pushados. Política registrada em CLAUDE.md, BRIEFING.md e na memory: **nunca** adicionar footer `Co-Authored-By: Claude` em commits; pushes vão direto para `main` (sem PR).
- **2026-05-17** — Fase 2 concluída. 6 modelos Mongoose escritos com embeds, índices (incluindo sparse) e comentários de decisão. Singleton de conexão lazy. Tipo `MetadadosPrograma` como união discriminada por tipo de projeto. Type-check e build passaram.
