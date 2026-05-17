# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Phase 1 of `BRIEFING.md` is done — Next.js 16.2.6 scaffold, dependencies, shadcn/ui, Tailwind v4 tokens, fonts, `docker-compose.yml` for MongoDB. See `PROGRESS.md` for the live checklist and what's pending. Read `BRIEFING.md` end-to-end before substantial work; it is the source of truth for stack, data model, and execution order. The design reference lives in `.design-ref/` (HTML/JSX prototype + chat transcript) — use as visual mirror, do not copy its internal structure.

## Git commit policy

**Never add `Co-Authored-By: Claude ...`, `Generated with Claude Code`, or any "made with Claude" footer** to commit messages in this repo. Commits must contain only the user-authored subject and body. This applies to amends, squashes, and PR descriptions equally.

Pushes go **directly to `main`** — this is a solo coursework repo, no PR flow. Don't open PRs unless explicitly asked. Remote is `https://github.com/elian-sss/pesquisahub.git`.

## What this project is

**PesquisaHub** — a monolithic web app for managing academic projects at UFOPA (Monitoria, PET, PIAPE, PIBIC, PD&I EMBRAPII, and an OUTRO catch-all). This is coursework for **Arquitetura e Desempenho de Banco de Dados**, so the grade hinges on demonstrating MongoDB's strengths: flexible schema, conscious embedding vs. referencing, sparse indexes, and aggregation pipelines. The UI matters but does not need to be perfect.

## Mandatory stack and forbidden choices

Stack: Next.js 15 (App Router only), React 19, TypeScript strict, Tailwind v4, Mongoose, NextAuth v5 (JWT), Zod, React Hook Form, shadcn/ui, lucide-react, recharts, bcryptjs, sonner.

**Do not introduce**: Prisma, raw MongoDB driver (Mongoose only), Pages Router, Redux, SWR, React Query, SQL ORMs, OAuth providers. Server Components + Server Actions cover client-state needs.

## Architectural rules that are easy to violate

- **DB access lives on the server only.** Never import models or call Mongoose from a `'use client'` component.
- **Server Actions for mutations**, API Routes only for GETs consumed by client components.
- **Never use the term "FK" or "foreign key"** in code or comments — these are MongoDB **manual references**. Use "referência" or "ref manual". This is graded.
- **Domain names in Portuguese** (`projeto`, `equipe`, `cronograma`, `criado_em`), infrastructure names in English (`props`, `handlers`, `Schema`). Mongoose timestamp fields are renamed: `{ timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' } }`.
- **Zero `any`** without an inline justification comment.
- **Role-gated routes** via `middleware.ts` — ADMIN sees everything, COORDENADOR sees own projects, BOLSISTA sees projects they're on. Menu items also vary by role.
- **No `localStorage` / `sessionStorage`.**

## Data model — the load-bearing decisions

Six collections: `usuarios`, `programas`, `unidades_academicas`, `projetos`, `registros_horas`, `arquivos`. Full schemas in `BRIEFING.md` §"Modelagem do banco".

**Embedding vs. referencing decisions worth preserving (and commenting in the schemas):**
- `usuarios.contato | endereco | dados_bancarios | academico | preferencias` are embedded — they belong to the person and are always read with them.
- `projetos.equipe` is embedded as a **history of participation**, with `nome` denormalized for fast listing.
- `projetos.cronograma` is embedded with `entregas` nested inside metas — both have their own `_id` so they can be referenced from `registros_horas.meta_id` and `arquivos.vinculado_a.entrega_id`.
- `registros_horas` is its **own collection** because it grows unbounded per project.
- `arquivos` is its own collection because of size and lifecycle independence.

**`projetos.metadados_programa` is the demo centerpiece.** Declared as `Schema.Types.Mixed` in Mongoose; validated at the API/Server Action boundary with a **Zod discriminated union keyed on `projeto.tipo`** (MONITORIA / PET / PIAPE / PIBIC / PD_EMBRAPII / OUTRO). The "Passo 3" of the project creation form must render completely different fields per tipo — this is the single most important UI moment for the grade, because it visualizes the flexible-schema argument.

**Indexes** (declared in schemas via `schema.index()` — full list in `BRIEFING.md` §"Índices essenciais"). Use `sparse: true` for fields that only exist on some `tipo`s (e.g. `metadados_programa.semestre_letivo`). When writing aggregations for the dashboard, **add a code comment naming which index the pipeline is leveraging** — this is explicitly part of the rubric.

## DB connection pattern

`lib/db/connection.ts` must implement the **global-cached Mongoose singleton** for Next.js (`global.mongoose = { conn, promise }`). Without this, hot reload in dev opens a new connection on every request and exhausts the pool.

## Dashboard aggregations

Each role gets a different server component:
- Admin: counts by status / tipo / programa (`$group`), latest projects.
- Coordenador: own projects with **% metas concluídas** (compute via `$unwind` on `cronograma` + `$group`), pending hours awaiting approval.
- Bolsista: assigned tasks, monthly hours, upcoming entregas.

Prefer `populate()` for simple joins; use `$lookup` only when the pipeline already needs aggregation. Decide per-query.

## Identity / visual

Primária `#0F4C5C`, acento `#E8B339`, bg `#FAFAF7`, texto `#1A1A1A`. Status: verde `#10B981`, âmbar `#F59E0B`, vermelho `#EF4444`, cinza `#6B7280`. Serif (Fraunces or Playfair) for titles, Inter for body — both via `next/font/google` in the root layout. Configure in `tailwind.config.ts`.

## Execution order

`BRIEFING.md` defines 8 phases (Setup → Banco/modelos → Validação/auth → Layout → Páginas → API/Server Actions → Seed → Polish). The user expects a **summary at the end of each phase before continuing** — pause and report, do not run all phases unattended.

## Out of scope (do not build now)

Real file upload (mock with filename input), real PDF/XLSX export, automated tests, deploy, OAuth, admin CRUD pages for usuários/programas (use seed). Once the app is scaffolded, expected commands will be `npm run dev`, `npm run build`, `npm run lint`, and `npm run seed` (defined in step 27 of the briefing). Update this section with the actual commands once `package.json` exists.
