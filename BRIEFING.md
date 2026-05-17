# Prompt para Claude Code — PesquisaHub UFOPA (v2)

> **Como usar:** salve como `BRIEFING.md` na pasta vazia onde quer criar o projeto, rode `claude` lá dentro e peça: *"Leia o BRIEFING.md e me apresente o plano antes de executar."*

---

## Objetivo

Construir o **PesquisaHub**, uma aplicação web monolítica para gestão de projetos acadêmicos da UFOPA. O sistema centraliza administração, cronograma e indicadores de projetos de **Monitoria, PET, PIAPE, PIBIC e EMBRAPII**, com suporte para outros tipos.

Trata-se de um trabalho de disciplina de **Arquitetura e Desempenho de Banco de Dados**, então o foco principal é demonstrar uso adequado do MongoDB (schema flexível, embedding consciente, índices, agregações). O front é importante mas não precisa ser perfeito.

---

## Stack obrigatória

- **Next.js 15** com App Router (sem Pages Router)
- **TypeScript** em modo estrito
- **React 19** (vem com Next 15)
- **Tailwind CSS v4** para estilização
- **MongoDB** + **Mongoose** como ODM
- **NextAuth.js v5** (Auth.js) para autenticação, estratégia JWT
- **Zod** para validação de payloads de API
- **React Hook Form** para formulários grandes
- **lucide-react** para ícones
- **recharts** para gráficos do dashboard
- **bcryptjs** para hash de senha
- **shadcn/ui** para componentes base (instalar só os necessários: button, card, input, label, select, dialog, tabs, table, badge, dropdown-menu, sonner)

Não usar: Prisma, MongoDB nativo sem Mongoose, Pages Router, Redux, SWR/React Query (Server Components + Server Actions são suficientes), ORMs SQL.

---

## Perfis de usuário

1. **ADMIN** — acesso total, vê todos os projetos da instituição
2. **COORDENADOR** — vê apenas seus projetos, gerencia equipe e cronograma
3. **BOLSISTA** — vê projetos dos quais participa, registra horas, atualiza entregas

Implementar via campo `role` no documento de usuário + middleware Next.js que protege rotas.

---

## Identidade visual

Manter consistência com o protótipo já definido:

- **Primária:** `#0F4C5C` (azul-petróleo)
- **Acento:** `#E8B339` (âmbar)
- **Background:** `#FAFAF7` (off-white)
- **Texto:** `#1A1A1A` (grafite)
- **Status:** verde `#10B981`, âmbar `#F59E0B`, vermelho `#EF4444`, cinza `#6B7280`

Tipografia: serif para títulos (Fraunces ou Playfair via Google Fonts), Inter para corpo e UI. Cantos arredondados suaves, sombras leves, espaçamento generoso.

---

## Modelagem do banco

**Nota importante sobre terminologia:** MongoDB não tem foreign keys. Os campos `*_id` são **referências manuais** — convenção da aplicação para guardar o `_id` de outro documento. A integridade referencial é responsabilidade do código (Mongoose `populate()` resolve as referências quando necessário). Não use o termo "FK" no código nem nos comentários — prefira "ref manual" ou apenas "referência".

São **6 coleções**: `usuarios`, `programas`, `unidades_academicas`, `projetos`, `registros_horas`, `arquivos`.

### `usuarios`

```typescript
{
  _id: ObjectId,
  nome: string,
  email: string,                    // unique
  senha_hash: string,
  role: "ADMIN" | "COORDENADOR" | "BOLSISTA",
  categoria: "docente" | "tecnico_administrativo" | "discente_graduacao" | "discente_pos" | "externo",
  matricula?: string,
  curso?: string,
  unidade_academica_id?: ObjectId,  // ref → unidades_academicas
  campus?: string,

  contato?: {                       // embed: sempre lido junto
    telefone?: string,
    telefone_emergencia?: string
  },

  endereco?: {                      // embed: pertence à pessoa
    logradouro?: string,
    bairro?: string,
    cidade?: string,
    estado?: string,
    cep?: string
  },

  dados_bancarios?: {               // embed: usado para emitir folha de bolsa
    banco?: string,
    agencia?: string,
    conta?: string,
    tipo?: "corrente" | "poupanca"
  },

  academico?: {                     // embed: identificadores acadêmicos
    lattes?: string,
    orcid?: string,
    semestre_ingresso?: string,
    previsao_conclusao?: string
  },

  preferencias?: {                  // embed: configurações do usuário
    notificacoes_email: boolean,
    notificacoes_sistema: boolean,
    tema: "claro" | "escuro"
  },

  criado_em: Date,
  atualizado_em: Date
}
```

### `programas`

```typescript
{
  _id: ObjectId,
  sigla: string,                    // unique
  nome_completo: string,
  tipo: "MONITORIA" | "PET" | "PIAPE" | "PIBIC" | "PD_EMBRAPII" | "OUTRO",
  pro_reitoria: string,             // PROEN, PROPPIT, PROPLAN, etc.
  natureza: "interno" | "externo",
  site?: string,

  modalidades_bolsa: [              // embed: pequeno e estável
    {
      nome: string,
      valor: number,
      agencia_pagadora?: string,    // CNPq, FAPESPA, UFOPA
      duracao_meses?: number
    }
  ],

  regulamento?: {                   // embed: meta sobre o regulamento vigente
    url_documento?: string,
    data_aprovacao?: Date,
    versao?: string
  },

  contato_responsavel?: {           // embed: quem coordena o programa
    nome?: string,
    email?: string,
    telefone?: string
  },

  requisitos?: {                    // embed: flags para validação de formulário
    exige_lattes: boolean,
    exige_plano_trabalho: boolean,
    exige_relatorio_parcial: boolean,
    exige_relatorio_final: boolean,
    exige_apresentacao_seminario: boolean
  },

  ativo: boolean,
  criado_em: Date
}
```

### `unidades_academicas`

```typescript
{
  _id: ObjectId,
  sigla: string,                    // unique
  nome: string,
  campus: string,
  tipo: "instituto" | "campus" | "nucleo"
}
```

Manter enxuto. Se a aplicação evoluir, dá pra embedar `endereco`, `contato` e `direcao`. Não precisa agora.

### `projetos`

```typescript
{
  _id: ObjectId,
  titulo: string,
  descricao: string,
  tipo: "MONITORIA" | "PET" | "PIAPE" | "PIBIC" | "PD_EMBRAPII" | "OUTRO",
  status: "planejado" | "em_andamento" | "concluido" | "atrasado" | "cancelado",
  sigaa_id?: string,

  programa_id: ObjectId,            // ref → programas
  unidade_academica_id: ObjectId,   // ref → unidades_academicas
  campus: string,

  vigencia: {                       // embed
    inicio: Date,
    fim: Date,
    prorrogacoes: [
      {
        nova_data_fim: Date,
        motivo: string,
        registrado_em: Date
      }
    ]
  },

  equipe: [                         // embed: histórico de quem participou
    {
      usuario_id: ObjectId,         // ref → usuarios
      nome: string,                 // desnormalizado para listagens rápidas
      papel: "coordenador" | "monitor" | "bolsista" | "voluntario" | "colaborador",
      categoria: string,
      tipo_vinculo?: "bolsista" | "voluntario",
      valor_bolsa?: number,
      carga_horaria_semanal?: number,
      periodo: { inicio: Date, fim?: Date }
    }
  ],

  cronograma: [                     // embed: metas com entregas aninhadas
    {
      _id: ObjectId,
      titulo: string,
      prazo: Date,
      status: "planejado" | "em_andamento" | "concluido" | "atrasado",
      concluido_em?: Date,
      entregas: [
        {
          _id: ObjectId,
          descricao: string,
          status: "pendente" | "em_andamento" | "concluido",
          responsavel_id?: ObjectId, // ref → usuarios
          arquivo_id?: ObjectId      // ref → arquivos
        }
      ]
    }
  ],

  metadados_programa: Mixed,        // forma varia por tipo — ver abaixo

  recursos: {                       // embed
    repositorio_git?: string,
    drive?: string,
    outros: [{ nome: string, url: string, tipo: string }]
  },

  criado_em: Date,
  atualizado_em: Date
}
```

### Variações de `metadados_programa` por tipo

Declarar como `Schema.Types.Mixed` no Mongoose. Validar com Zod no API layer usando discriminated unions baseadas no campo `tipo` do projeto pai.

**MONITORIA:**
```typescript
{
  subtipo: "DISCIPLINA" | "LABORATORIO",
  modalidade: "remunerada" | "voluntaria",
  semestre_letivo: string,                // ex: "2025.2"
  carga_horaria_semanal: number,
  disciplina?: {                          // se subtipo = DISCIPLINA
    codigo: string,
    nome: string,
    turma: string,
    num_alunos_atendidos?: number
  },
  laboratorio?: {                         // se subtipo = LABORATORIO
    nome: string,
    sigla?: string,
    responsavel_tecnico?: string
  },
  atividades_previstas: string[]
}
```

**PET:**
```typescript
{
  grupo: string,
  area_tematica: string,
  ano_criacao: number,
  tutor_atual_id: ObjectId,              // ref → usuarios
  num_bolsistas_atual: number,
  atividades: {
    ensino: string[],
    pesquisa: string[],
    extensao: string[]
  }
}
```

**PIAPE:**
```typescript
{
  unidade_demandante: string,
  tipo_demanda: "servico" | "produto" | "processo",
  problema_institucional: string,
  solucao_proposta: string,
  categoria_inovacao: string,
  coordenador_categoria: "docente" | "tecnico_administrativo",
  beneficiarios_estimados?: number
}
```

**PIBIC:**
```typescript
{
  modalidade: "PIBIC" | "PIBITI" | "PIBIC_EM",
  tem_bolsa: boolean,                    // bolsista vs voluntário
  area_cnpq_codigo: string,              // ex: "1.03.03.04-2"
  area_cnpq_nome: string,                // ex: "Engenharia de Software"
  agencia_pagadora: "CNPq" | "FAPESPA" | "UFOPA",
  plano_trabalho: string,
  lattes_orientador_snapshot?: string,   // snapshot no momento da submissão
  lattes_bolsista_snapshot?: string,
  produtos_esperados: {
    publicacoes: number,
    apresentacao_seminario: boolean
  }
}
```

**PD_EMBRAPII:**
```typescript
{
  empresa_parceira: {
    razao_social: string,
    cnpj: string,
    porte: "micro" | "pequena" | "media" | "grande"
  },
  trl_inicial: number,                   // 1-9
  trl_alvo: number,                      // 1-9
  area_tecnologica: string,
  valor_total: number,
  valor_contrapartida_empresa: number,
  valor_embrapii: number,
  valor_unidade: number,
  marcos_contratuais: [
    {
      descricao: string,
      prazo: Date,
      concluido: boolean
    }
  ]
}
```

**OUTRO:**
```typescript
{
  descricao_programa: string,            // único campo obrigatório
  // resto livre
}
```

### `registros_horas`

```typescript
{
  _id: ObjectId,
  projeto_id: ObjectId,                  // ref → projetos
  usuario_id: ObjectId,                  // ref → usuarios
  meta_id?: ObjectId,                    // ref → cronograma._id dentro de projetos
  data: Date,
  horas: number,
  atividade: string,
  tipo: "desenvolvimento" | "reuniao" | "escrita" | "pesquisa" | "ensino" | "extensao" | "outros",
  status: "pendente" | "aprovado" | "rejeitado",

  aprovacao?: {                          // embed: dados da aprovação
    aprovador_id: ObjectId,              // ref → usuarios
    aprovado_em: Date,
    observacao?: string
  },

  criado_em: Date
}
```

### `arquivos`

```typescript
{
  _id: ObjectId,
  projeto_id: ObjectId,                  // ref → projetos
  enviado_por: ObjectId,                 // ref → usuarios
  nome: string,
  tipo_documento: string,                // ex: "relatorio_parcial", "plano_trabalho"
  mime_type: string,
  tamanho_bytes: number,
  url_storage: string,                   // S3, MinIO ou caminho local

  metadata_arquivo?: {                   // embed: dados técnicos
    hash_sha256?: string,
    num_paginas?: number,
    versao?: number,
    versao_anterior_id?: ObjectId        // ref → arquivos (versão antiga)
  },

  vinculado_a?: {                        // embed: a que parte do projeto este arquivo pertence
    meta_id?: ObjectId,                  // ref → cronograma._id
    entrega_id?: ObjectId                // ref → entrega._id
  },

  tags?: string[],
  enviado_em: Date
}
```

### Índices essenciais

```javascript
// projetos
projetoSchema.index({ tipo: 1, status: 1 });
projetoSchema.index({ programa_id: 1 });
projetoSchema.index({ unidade_academica_id: 1, campus: 1 });
projetoSchema.index({ "equipe.usuario_id": 1 });
projetoSchema.index({ "vigencia.fim": 1, status: 1 });
projetoSchema.index({ sigaa_id: 1 }, { sparse: true });
projetoSchema.index({ "metadados_programa.unidade_demandante": 1 }, { sparse: true });
projetoSchema.index({ "metadados_programa.semestre_letivo": 1 }, { sparse: true });

// registros_horas
registroHorasSchema.index({ projeto_id: 1, data: -1 });
registroHorasSchema.index({ usuario_id: 1, data: -1 });
registroHorasSchema.index({ status: 1, projeto_id: 1 });

// usuarios
usuarioSchema.index({ email: 1 }, { unique: true });
usuarioSchema.index({ matricula: 1 }, { sparse: true, unique: true });
usuarioSchema.index({ role: 1 });

// arquivos
arquivoSchema.index({ projeto_id: 1, tipo_documento: 1 });
arquivoSchema.index({ "vinculado_a.meta_id": 1 }, { sparse: true });

// programas
programaSchema.index({ sigla: 1 }, { unique: true });
programaSchema.index({ tipo: 1, ativo: 1 });
```

---

## Estrutura de pastas esperada

```
pesquisahub/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx
│   │   ├── projetos/
│   │   │   ├── page.tsx
│   │   │   ├── novo/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── horas/page.tsx
│   │   ├── relatorios/page.tsx
│   │   └── layout.tsx              # sidebar desktop + bottom-nav mobile
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── projetos/route.ts
│   │   ├── projetos/[id]/route.ts
│   │   ├── horas/route.ts
│   │   └── usuarios/route.ts
│   ├── layout.tsx
│   ├── page.tsx                    # redireciona pra /login ou /dashboard
│   └── globals.css
├── components/
│   ├── ui/                         # shadcn components
│   ├── projetos/
│   │   ├── ProjetoCard.tsx
│   │   ├── FormProjeto.tsx         # multi-step com campos dinâmicos por tipo
│   │   └── MetadadosProgramaFields.tsx
│   ├── cronograma/
│   ├── dashboard/
│   │   ├── DashboardAdmin.tsx
│   │   ├── DashboardCoordenador.tsx
│   │   └── DashboardBolsista.tsx
│   └── shared/
│       ├── Sidebar.tsx
│       ├── BottomNav.tsx
│       ├── StatusBadge.tsx
│       └── Avatar.tsx
├── lib/
│   ├── db/connection.ts            # singleton Mongoose
│   ├── auth/config.ts              # NextAuth config
│   ├── auth/session.ts             # helpers de sessão
│   ├── validators/                 # schemas Zod
│   └── utils.ts
├── models/
│   ├── Usuario.ts
│   ├── Programa.ts
│   ├── UnidadeAcademica.ts
│   ├── Projeto.ts
│   ├── RegistroHoras.ts
│   └── Arquivo.ts
├── types/
│   └── index.ts                    # enums e interfaces compartilhadas
├── scripts/
│   └── seed.ts                     # popula o banco
├── middleware.ts                   # protege rotas por role
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Plano de execução (faça nesta ordem)

### Fase 1 — Setup
1. Inicializar Next.js 15 com TypeScript, Tailwind v4, App Router, ESLint.
2. Instalar dependências: `mongoose bcryptjs next-auth@beta zod react-hook-form @hookform/resolvers lucide-react recharts sonner`. Tipos: `@types/bcryptjs`.
3. Inicializar shadcn/ui (`npx shadcn@latest init`) e adicionar componentes listados.
4. Criar `.env.local.example` com `MONGODB_URI`, `AUTH_SECRET`, `NEXTAUTH_URL`.
5. Configurar Tailwind com as cores da identidade visual no `tailwind.config.ts`.
6. Configurar fontes (Fraunces serif + Inter sans) via `next/font/google` no `app/layout.tsx`.

### Fase 2 — Banco e modelos
7. Implementar `lib/db/connection.ts` com singleton de conexão Mongoose (padrão recomendado para Next.js — global cached connection para evitar reconexão a cada hot reload).
8. Implementar os 6 schemas Mongoose em `models/`, **respeitando o aninhamento descrito acima**. Para `metadados_programa`, usar `Schema.Types.Mixed`. Adicionar timestamps automáticos onde aplicável (`{ timestamps: { createdAt: 'criado_em', updatedAt: 'atualizado_em' } }`).
9. Criar índices no schema usando `schema.index()`.
10. Em `types/index.ts`, declarar enums e interfaces TypeScript correspondentes.

### Fase 3 — Validação e autenticação
11. Criar validators Zod em `lib/validators/` para cada coleção — incluindo **discriminated unions** para `metadados_programa` por tipo de projeto. Subdocumentos embedados (contato, endereco, dados_bancarios, etc.) também precisam de schemas Zod próprios para reuso.
12. Configurar NextAuth v5 com Credentials provider: email + senha, verificação com bcrypt, JWT strategy. Incluir `role` e `usuario_id` na sessão.
13. Implementar `middleware.ts` para proteger `(dashboard)/*` e redirecionar não-autenticados para `/login`. Restringir rotas administrativas por role.

### Fase 4 — Layout e navegação
14. Criar layout `(dashboard)/layout.tsx` com sidebar fixa em desktop (≥1024px) e bottom-nav em mobile. Header com avatar, nome, role e logout.
15. Itens de menu variam por role (ex: bolsista não vê "Cadastrar Projeto"; admin vê "Usuários").
16. Tela de login (`(auth)/login/page.tsx`) com formulário simples e 3 botões de acesso rápido (Admin, Coordenador, Bolsista) usando usuários de seed.

### Fase 5 — Páginas principais

17. **Dashboard** (`/dashboard`) — server component que decide qual sub-componente renderizar conforme `session.user.role`. Cada um carrega dados via agregações MongoDB:
    - Admin: total de projetos por status (`$group`), por tipo, por programa; lista de últimos cadastrados.
    - Coordenador: seus projetos com progresso (calcular % de metas concluídas via `$unwind` + `$group`); horas pendentes de aprovação.
    - Bolsista: tarefas atribuídas a ele, horas do mês, próximas entregas.
18. **Lista de projetos** (`/projetos`) — server component com filtros via search params (tipo, status, programa). Tabela em desktop, cards em mobile.
19. **Detalhe** (`/projetos/[id]`) — abas: Visão Geral, Cronograma, Horas, Arquivos, Equipe. Server components para dados, client components para interatividade (marcar entrega concluída, etc.).
20. **Cadastro** (`/projetos/novo`) — formulário multi-step (React Hook Form + Zod):
    - Passo 1: dados básicos (título, descrição, tipo)
    - Passo 2: fomento (programa, vigência, valores quando aplicável)
    - Passo 3: **campos dinâmicos por tipo** — esse é o destaque da demo. Renderizar campos específicos via `MetadadosProgramaFields` que faz switch no tipo. Este componente comprova o uso do schema flexível.
    - Passo 4: equipe inicial
    - Passo 5: revisão e submit
21. **Registro de horas** (`/horas`) — formulário simples + lista das últimas entradas. Coordenador vê com botões de aprovar/rejeitar (atualiza o objeto `aprovacao` embedado).

### Fase 6 — API Routes e Server Actions
22. Implementar API routes RESTful para cada coleção: GET (lista com filtros), GET por id, POST, PATCH, DELETE. Cada handler valida com Zod, faz query no Mongoose, retorna JSON tipado.
23. Alternativamente, usar Server Actions para mutações disparadas a partir dos formulários (recomendado no App Router). API Routes só para GET de dados que serão consumidos por componentes client.
24. Tratar erros com mensagens claras (toast via sonner no client).
25. Em queries que precisam de dados de coleções referenciadas (ex: listar projetos com nome do programa), usar `populate()` do Mongoose ou `$lookup` em pipelines de agregação. **Decidir caso a caso** — populate é mais simples; lookup é melhor para relatórios complexos.

### Fase 7 — Seed
26. Criar `scripts/seed.ts` que limpa o banco e popula com:
    - 3 unidades acadêmicas (ICED, IBEF, ICTA)
    - 5 programas (Monitoria, PET, PIAPE, PIBIC, EMBRAPII) **com os campos novos `requisitos`, `regulamento` e `contato_responsavel` preenchidos**
    - 8 usuários (1 admin, 3 coordenadores, 4 bolsistas) com senhas hashadas e **objetos embedados (`contato`, `endereco`, `academico`, `preferencias`) preenchidos**
    - 6 projetos cobrindo todos os tipos
    - Cada projeto com cronograma de 3-4 metas e algumas entregas
    - 20-30 registros de horas distribuídos, alguns aprovados (com `aprovacao` preenchida) e alguns pendentes
    - 4-5 arquivos com `metadata_arquivo` e `vinculado_a` preenchidos
27. Adicionar script `npm run seed` no `package.json`.
28. Documentar no README como rodar.

### Fase 8 — Polish
29. README.md com: o que é, stack, como rodar localmente (incluindo MongoDB via Docker), variáveis de ambiente, credenciais de seed, **nota sobre referências manuais vs FK** (vale para ganhar pontos na disciplina).
30. Empty states e loading states em todas as listagens.
31. Verificar responsividade em viewport mobile (375px) e desktop (1280px).

---

## Política de commits

- **Nunca** adicionar `Co-Authored-By: Claude ...`, `Generated with Claude Code` ou qualquer rodapé "made with Claude" nas mensagens de commit. Mensagens contêm apenas o assunto e o corpo escritos pelo usuário.
- Pushes vão **direto para `main`** — repositório solo de TCC, sem fluxo de PR.
- Remoto: `https://github.com/elian-sss/pesquisahub.git`.

---

## Critérios de qualidade

- TypeScript estrito, **zero `any`** sem justificativa
- Componentes server por padrão; client components só onde há interatividade (`'use client'`)
- Acesso ao banco **apenas no servidor** (nunca em client components)
- Não usar `localStorage` nem `sessionStorage`
- Mensagens de erro descritivas e tratamento adequado
- Componentes pequenos e focados (≤200 linhas idealmente)
- Nomes em português para conceitos de domínio (projeto, equipe, cronograma) e inglês para infraestrutura (props, types, handlers)
- Comentários só onde a intenção não é óbvia pelo código
- **Não usar o termo "foreign key" ou "FK"** no código nem nos comentários — use "referência" ou "ref manual"

---

## Pontos importantes para a apresentação

1. **Passo 3 do cadastro de projeto** (campos dinâmicos por tipo) é o que mais reforça a justificativa do MongoDB. Implementar bem: ao trocar o tipo no dropdown, o formulário deve mostrar campos completamente diferentes. Os mesmos dados são salvos numa única coleção `projetos`, sem coluna nula nem tabela auxiliar. Esse é o argumento central da disciplina.

2. **Aninhamento consciente** em `usuarios`, `programas`, `arquivos` e `registros_horas` — saber **quando embedar** (endereço pertence à pessoa) e **quando referenciar** (registros de horas crescem sem limite) demonstra entendimento do modelo de documentos. Comente decisões importantes no código.

3. **Agregações no dashboard** com `$match`/`$unwind`/`$group`/`$lookup` em vez de várias queries — pedi que comente quais índices estão sendo aproveitados em cada query.

4. **Índices sparse** declarados nos modelos pra performance específica por tipo sem custo nos demais.

---

## O que NÃO fazer agora

- Não implementar upload real de arquivos (mock com input + nome só)
- Não implementar exportação real para PDF/XLSX nos relatórios (apenas a UI da página de relatórios com dados mockados ou agregação simples)
- Não criar testes automatizados nesta etapa
- Não fazer deploy
- Não configurar OAuth (Google/GitHub) — Credentials provider é suficiente
- Não criar páginas de admin para CRUD de usuários/programas — fazer via seed por enquanto

---

## Como prosseguir

Comece confirmando o entendimento do escopo e me apresentando um plano resumido antes de executar a Fase 1. Pause ao final de cada fase para reportar o que foi feito antes de seguir. Se encontrar ambiguidade em alguma decisão técnica, pergunte em vez de inventar.

Boa execução.