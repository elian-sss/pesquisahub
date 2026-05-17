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

## Fase 2 — Banco e modelos

- [ ] `lib/db/connection.ts` com singleton Mongoose cacheado em `global`
- [ ] `models/Usuario.ts` (com embeds: contato, endereco, dados_bancarios, academico, preferencias)
- [ ] `models/Programa.ts` (com embeds: modalidades_bolsa, regulamento, contato_responsavel, requisitos)
- [ ] `models/UnidadeAcademica.ts`
- [ ] `models/Projeto.ts` (com embeds: vigencia, equipe, cronograma com entregas aninhadas, recursos; metadados_programa como Mixed)
- [ ] `models/RegistroHoras.ts` (com embed aprovacao)
- [ ] `models/Arquivo.ts` (com embeds metadata_arquivo, vinculado_a)
- [ ] Índices em todos os schemas (incluindo sparse)
- [ ] `types/index.ts` com enums e interfaces compartilhadas

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
