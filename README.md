# PesquisaHub

Sistema de gestão de projetos acadêmicos da **UFOPA**, cobrindo programas de **Monitoria, PET, PIAPE, PIBIC e P&D EMBRAPII** (mais um tipo `OUTRO` de catch-all).

Desenvolvido como trabalho da disciplina **Arquitetura e Desempenho de Banco de Dados** — o foco é demonstrar uso adequado do MongoDB (schema flexível, embedding consciente, índices, agregações).

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript estrito) |
| UI | React 19, Tailwind v4, shadcn/ui (base-ui), lucide-react, recharts |
| Banco | MongoDB 7 + Mongoose 9 |
| Auth | NextAuth v5 (Auth.js) — Credentials + JWT + bcrypt |
| Validação | Zod 4 (com `z.discriminatedUnion`) |
| Forms | React Hook Form |
| Toasts | sonner |

**Mutações via Server Actions** (não API Routes). API Routes só ficariam necessárias para reads consumidos por client components — todas as nossas páginas são server components que consultam o Mongoose direto.

## Estrutura

```
app/
├── (auth)/login/             # Tela de login + 3 botões de acesso rápido
├── (dashboard)/              # Layout protegido (Sidebar + Topbar + MobileNav)
│   ├── dashboard/            # Dispatcher por role
│   ├── projetos/             # Lista, detalhe (5 abas) e cadastro multi-step
│   ├── cronograma/           # Gantt global agrupado por mês
│   ├── horas/                # Registro + aprovação
│   ├── relatorios/           # Charts agregados
│   └── usuarios/             # Admin-only
└── api/auth/[...nextauth]/   # Único endpoint REST (NextAuth)
components/
├── shared/                   # Sidebar, Topbar, Avatar, StatusBadge, KPI, ...
├── dashboard/                # DashboardAdmin/Coordenador/Bolsista + Charts
└── ui/                       # shadcn primitives
lib/
├── db/connection.ts          # Singleton Mongoose cacheado em global
├── auth/                     # Config edge-safe + setup completo + helpers
├── validators/               # Schemas Zod (incluindo discriminated union)
├── queries/                  # Aggregations comentando os índices que aproveitam
├── actions/                  # Server Actions
└── ui-utils.ts, page-titles.ts, seed-credentials.ts
models/                       # 6 schemas Mongoose com embeds e índices
scripts/seed.ts               # Popula o banco com dados realistas
types/index.ts                # Enums + união discriminada MetadadosPrograma
middleware.ts                 # Proteção por role (ADMIN para /usuarios)
.design-ref/                  # Protótipo HTML/JSX original (espelho visual)
```

## Como rodar localmente

### Pré-requisitos

- **Node.js ≥ 20.6** (precisamos do flag `--env-file`)
- **Docker Desktop** (para subir o MongoDB)

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Subir o MongoDB
docker compose up -d

# 3. Copiar o arquivo de variáveis de ambiente
cp .env.local.example .env.local
# (em prod, troque AUTH_SECRET por: openssl rand -base64 32)

# 4. Popular o banco
npm run seed

# 5. Subir o app em dev
npm run dev
# → http://localhost:3000
```

Para parar o Mongo: `docker compose down` (dados persistem no volume `pesquisahub_mongo_data`).
Para zerar tudo: `docker compose down -v`.

### Credenciais de demo

Todos os usuários do seed compartilham a mesma senha: **`pesquisahub2026`**.

| Papel | E-mail |
|---|---|
| Admin | `admin@ufopa.edu.br` |
| Coordenador | `maria.silva@ufopa.edu.br` |
| Bolsista | `joao.pereira@aluno.ufopa.edu.br` |

A tela de login tem **3 botões de acesso rápido** que entram direto com essas credenciais. Trocar de role dá ao app uma navegação completamente diferente (Sidebar filtra itens, dashboard muda, permissões mudam).

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Dev server com hot reload (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Servir o build |
| `npm run lint` | ESLint |
| `npm run seed` | Limpa e popula o banco |

## Variáveis de ambiente

`.env.local.example` lista todas. Resumo:

- `MONGODB_URI` — string de conexão Mongoose
- `AUTH_SECRET` — segredo do NextAuth (gere com `openssl rand -base64 32`)
- `NEXTAUTH_URL` — base URL do app (`http://localhost:3000` em dev)

## Notas sobre o uso do MongoDB

**MongoDB não tem foreign keys.** Os campos `*_id` nos schemas (ex: `projeto.programa_id`, `registro.usuario_id`) são **referências manuais** — uma convenção da aplicação para guardar o `_id` de outro documento. A integridade referencial é responsabilidade do código (`populate()` resolve as referências quando necessário).

No código você nunca verá os termos "FK" ou "foreign key" — usamos sempre **"ref manual"** ou apenas "referência".

### Decisões de modelagem que vale destacar

| Coleção / campo | Decisão | Por quê |
|---|---|---|
| `usuarios.contato`, `endereco`, `dados_bancarios`, `academico`, `preferencias` | **Embed** | Pertencem à pessoa e são sempre lidos junto com ela |
| `projetos.equipe` | **Embed** (array) | Histórico de participação; `nome` desnormalizado para listagens rápidas |
| `projetos.cronograma` | **Embed** com entregas aninhadas | Metas têm `_id` próprio para serem alvo de referência de `registros_horas.meta_id` e `arquivos.vinculado_a` |
| `projetos.metadados_programa` | **`Schema.Types.Mixed`** | Forma varia por tipo (MONITORIA/PET/PIAPE/PIBIC/EMBRAPII/OUTRO). Validação em runtime via `z.discriminatedUnion` no API layer. Schema flexível sem necessidade de migration ao evoluir um tipo. |
| `registros_horas` | **Coleção própria** | Cresce sem limite por projeto |
| `arquivos` | **Coleção própria** | Tamanho independente; ciclo de vida próprio |

### Índices declarados

Cada modelo declara seus próprios índices via `schema.index()`. Destaques:

- `projetos`: `{tipo:1, status:1}`, `{programa_id:1}`, `{unidade_academica_id:1, campus:1}`, `{"equipe.usuario_id":1}` (multikey), `{"vigencia.fim":1, status:1}`, `{sigaa_id:1}` sparse, e **2 índices sparse em `metadados_programa`** (`unidade_demandante`, `semestre_letivo`) — só pagam custo de manutenção nos tipos que usam aquele campo
- `usuarios`: `email` unique (no field), `{matricula:1}` sparse+unique, `{role:1}`
- `registros_horas`: `{projeto_id:1, data:-1}`, `{usuario_id:1, data:-1}`, `{status:1, projeto_id:1}`
- `arquivos`: `{projeto_id:1, tipo_documento:1}`, `{"vinculado_a.meta_id":1}` sparse

### Agregações

Cada pipeline em `lib/queries/` traz um comentário **`// Aproveita: { ... }`** indicando qual índice está sendo utilizado. Exemplos:

- **Dashboard Admin**: `$group` por tipo/status/programa, `$lookup` com `programas`, `$unwind`+`$group` para contar bolsistas distintos
- **Dashboard Coordenador**: `$elemMatch` em `equipe`, depois `$size`+`$filter` no cronograma para calcular `% metas concluídas` num único pipeline
- **Cronograma global**: `$unwind` em `cronograma` para virar uma lista plana de metas ordenadas por prazo
- **Validação `metadados_programa`**: `z.discriminatedUnion("tipo", [...])` no Zod garante que cada tipo de projeto só aceita a forma correta dos metadados

## Pontos críticos para a apresentação

1. **Cadastro de projeto — Passo 3 (`MetadadosProgramaFields`)**: trocar o tipo no dropdown faz o formulário mostrar campos **completamente diferentes**. Os mesmos dados são salvos numa única coleção `projetos`, sem coluna nula nem tabela auxiliar. Esse é o argumento central da disciplina.

2. **Aninhamento consciente** em `usuarios`, `programas`, `arquivos`, `registros_horas`. Saber **quando embedar** (endereço pertence à pessoa) e **quando referenciar** (registros de horas crescem sem limite).

3. **Agregações no dashboard** com `$match`/`$unwind`/`$group`/`$lookup` em vez de várias queries.

4. **Índices sparse** declarados nos modelos para performance específica por tipo sem custo nos demais.

## Documentos auxiliares

- `BRIEFING.md` — especificação completa (modelagem detalhada de todos os tipos de `metadados_programa`)
- `CLAUDE.md` — regras para futuras sessões de Claude Code (políticas de commit, decisões críticas)
- `PROGRESS.md` — checklist de execução fase por fase, com decisões e notas
- `DESIGN.md` — link para o design original
- `.design-ref/` — bundle do protótipo HTML/JSX original (referência visual)

## Licença

Trabalho acadêmico — UFOPA, 2026.
