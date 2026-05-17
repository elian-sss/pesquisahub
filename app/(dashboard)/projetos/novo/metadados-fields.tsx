"use client";

import type { TipoProjeto } from "@/types";

// ============================================================
// O componente-chave da demonstracao do MongoDB:
// Ao trocar o `tipo` no passo anterior, os campos renderizados aqui
// mudam completamente. Os mesmos dados sao salvos numa unica colecao
// `projetos`, no campo `metadados_programa` (Schema.Types.Mixed),
// sem coluna nula nem tabela auxiliar. Esse e o argumento central
// para o uso de schema flexivel no MongoDB.
// ============================================================

type Meta = Record<string, unknown>;

interface Props {
  tipo: TipoProjeto;
  value: Meta;
  onChange: (meta: Meta) => void;
}

const inputCls =
  "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function MetadadosProgramaFields({ tipo, value, onChange }: Props) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  const setNested = (parent: string, k: string, v: unknown) => {
    const current = (value[parent] as Record<string, unknown> | undefined) ?? {};
    onChange({ ...value, [parent]: { ...current, [k]: v } });
  };

  if (tipo === "MONITORIA") return <MonitoriaFields value={value} set={set} setNested={setNested} />;
  if (tipo === "PET") return <PetFields value={value} set={set} setNested={setNested} />;
  if (tipo === "PIAPE") return <PiapeFields value={value} set={set} />;
  if (tipo === "PIBIC") return <PibicFields value={value} set={set} setNested={setNested} />;
  if (tipo === "PD_EMBRAPII") return <EmbrapiiFields value={value} set={set} setNested={setNested} />;
  return <OutroFields value={value} set={set} />;
}

// -------------------- MONITORIA --------------------
function MonitoriaFields({
  value,
  set,
  setNested,
}: {
  value: Meta;
  set: (k: string, v: unknown) => void;
  setNested: (p: string, k: string, v: unknown) => void;
}) {
  const subtipo = (value.subtipo as string) ?? "";
  const disciplina = (value.disciplina as Record<string, unknown>) ?? {};
  const laboratorio = (value.laboratorio as Record<string, unknown>) ?? {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Subtipo *">
          <select
            className={inputCls}
            value={subtipo}
            onChange={(e) => set("subtipo", e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="DISCIPLINA">Disciplina</option>
            <option value="LABORATORIO">Laboratório</option>
          </select>
        </Field>
        <Field label="Modalidade *">
          <select
            className={inputCls}
            value={(value.modalidade as string) ?? ""}
            onChange={(e) => set("modalidade", e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="remunerada">Remunerada</option>
            <option value="voluntaria">Voluntária</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Semestre letivo *" hint="Formato AAAA.S — ex.: 2026.1">
          <input
            className={inputCls}
            value={(value.semestre_letivo as string) ?? ""}
            onChange={(e) => set("semestre_letivo", e.target.value)}
            placeholder="2026.1"
          />
        </Field>
        <Field label="Carga horária semanal *">
          <input
            type="number"
            className={inputCls}
            value={(value.carga_horaria_semanal as number) ?? ""}
            onChange={(e) => set("carga_horaria_semanal", Number(e.target.value))}
          />
        </Field>
      </div>

      {subtipo === "DISCIPLINA" && (
        <div className="border-l-2 border-primary pl-4 space-y-4">
          <div className="text-xs uppercase tracking-[0.06em] text-primary font-semibold">
            Disciplina
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Código">
              <input
                className={inputCls}
                value={(disciplina.codigo as string) ?? ""}
                onChange={(e) => setNested("disciplina", "codigo", e.target.value)}
              />
            </Field>
            <Field label="Nome">
              <input
                className={inputCls}
                value={(disciplina.nome as string) ?? ""}
                onChange={(e) => setNested("disciplina", "nome", e.target.value)}
              />
            </Field>
            <Field label="Turma">
              <input
                className={inputCls}
                value={(disciplina.turma as string) ?? ""}
                onChange={(e) => setNested("disciplina", "turma", e.target.value)}
              />
            </Field>
          </div>
        </div>
      )}

      {subtipo === "LABORATORIO" && (
        <div className="border-l-2 border-primary pl-4 space-y-4">
          <div className="text-xs uppercase tracking-[0.06em] text-primary font-semibold">
            Laboratório
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome">
              <input
                className={inputCls}
                value={(laboratorio.nome as string) ?? ""}
                onChange={(e) => setNested("laboratorio", "nome", e.target.value)}
              />
            </Field>
            <Field label="Responsável técnico">
              <input
                className={inputCls}
                value={(laboratorio.responsavel_tecnico as string) ?? ""}
                onChange={(e) =>
                  setNested("laboratorio", "responsavel_tecnico", e.target.value)
                }
              />
            </Field>
          </div>
        </div>
      )}

      <Field label="Atividades previstas" hint="Uma por linha">
        <textarea
          className={inputCls + " min-h-[80px]"}
          value={((value.atividades_previstas as string[]) ?? []).join("\n")}
          onChange={(e) =>
            set("atividades_previstas", e.target.value.split("\n").filter(Boolean))
          }
        />
      </Field>
    </div>
  );
}

// -------------------- PET --------------------
function PetFields({
  value,
  set,
  setNested,
}: {
  value: Meta;
  set: (k: string, v: unknown) => void;
  setNested: (p: string, k: string, v: unknown) => void;
}) {
  const atividades = (value.atividades as Record<string, unknown>) ?? {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Grupo PET *">
          <input
            className={inputCls}
            value={(value.grupo as string) ?? ""}
            onChange={(e) => set("grupo", e.target.value)}
            placeholder="PET-Computação"
          />
        </Field>
        <Field label="Área temática *">
          <input
            className={inputCls}
            value={(value.area_tematica as string) ?? ""}
            onChange={(e) => set("area_tematica", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Ano de criação *">
          <input
            type="number"
            className={inputCls}
            value={(value.ano_criacao as number) ?? ""}
            onChange={(e) => set("ano_criacao", Number(e.target.value))}
          />
        </Field>
        <Field label="Nº de bolsistas atual *">
          <input
            type="number"
            className={inputCls}
            value={(value.num_bolsistas_atual as number) ?? ""}
            onChange={(e) => set("num_bolsistas_atual", Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="border-l-2 border-primary pl-4 space-y-4">
        <div className="text-xs uppercase tracking-[0.06em] text-primary font-semibold">
          Atividades (uma por linha)
        </div>
        {(["ensino", "pesquisa", "extensao"] as const).map((cat) => (
          <Field key={cat} label={cat[0].toUpperCase() + cat.slice(1)}>
            <textarea
              className={inputCls + " min-h-[60px]"}
              value={((atividades[cat] as string[]) ?? []).join("\n")}
              onChange={(e) =>
                setNested(
                  "atividades",
                  cat,
                  e.target.value.split("\n").filter(Boolean),
                )
              }
            />
          </Field>
        ))}
      </div>
    </div>
  );
}

// -------------------- PIAPE --------------------
function PiapeFields({
  value,
  set,
}: {
  value: Meta;
  set: (k: string, v: unknown) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Unidade demandante *">
          <input
            className={inputCls}
            value={(value.unidade_demandante as string) ?? ""}
            onChange={(e) => set("unidade_demandante", e.target.value)}
          />
        </Field>
        <Field label="Tipo de demanda *">
          <select
            className={inputCls}
            value={(value.tipo_demanda as string) ?? ""}
            onChange={(e) => set("tipo_demanda", e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="servico">Serviço</option>
            <option value="produto">Produto</option>
            <option value="processo">Processo</option>
          </select>
        </Field>
      </div>
      <Field label="Problema institucional *">
        <textarea
          className={inputCls + " min-h-[80px]"}
          value={(value.problema_institucional as string) ?? ""}
          onChange={(e) => set("problema_institucional", e.target.value)}
        />
      </Field>
      <Field label="Solução proposta *">
        <textarea
          className={inputCls + " min-h-[80px]"}
          value={(value.solucao_proposta as string) ?? ""}
          onChange={(e) => set("solucao_proposta", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Categoria de inovação *">
          <input
            className={inputCls}
            value={(value.categoria_inovacao as string) ?? ""}
            onChange={(e) => set("categoria_inovacao", e.target.value)}
          />
        </Field>
        <Field label="Categoria do coordenador *">
          <select
            className={inputCls}
            value={(value.coordenador_categoria as string) ?? ""}
            onChange={(e) => set("coordenador_categoria", e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="docente">Docente</option>
            <option value="tecnico_administrativo">Técnico-administrativo</option>
          </select>
        </Field>
      </div>
      <Field label="Beneficiários estimados">
        <input
          type="number"
          className={inputCls}
          value={(value.beneficiarios_estimados as number) ?? ""}
          onChange={(e) =>
            set("beneficiarios_estimados", Number(e.target.value) || undefined)
          }
        />
      </Field>
    </div>
  );
}

// -------------------- PIBIC --------------------
function PibicFields({
  value,
  set,
  setNested,
}: {
  value: Meta;
  set: (k: string, v: unknown) => void;
  setNested: (p: string, k: string, v: unknown) => void;
}) {
  const produtos = (value.produtos_esperados as Record<string, unknown>) ?? {};
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Modalidade *">
          <select
            className={inputCls}
            value={(value.modalidade as string) ?? ""}
            onChange={(e) => set("modalidade", e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="PIBIC">PIBIC</option>
            <option value="PIBITI">PIBITI</option>
            <option value="PIBIC_EM">PIBIC-EM</option>
          </select>
        </Field>
        <Field label="Agência pagadora *">
          <select
            className={inputCls}
            value={(value.agencia_pagadora as string) ?? ""}
            onChange={(e) => set("agencia_pagadora", e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="CNPq">CNPq</option>
            <option value="FAPESPA">FAPESPA</option>
            <option value="UFOPA">UFOPA</option>
          </select>
        </Field>
        <Field label="Tem bolsa *">
          <select
            className={inputCls}
            value={value.tem_bolsa === true ? "sim" : value.tem_bolsa === false ? "nao" : ""}
            onChange={(e) => set("tem_bolsa", e.target.value === "sim")}
          >
            <option value="">Selecione</option>
            <option value="sim">Sim</option>
            <option value="nao">Não (voluntário)</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Código CNPq *" hint="Ex.: 1.03.03.04-2">
          <input
            className={inputCls}
            value={(value.area_cnpq_codigo as string) ?? ""}
            onChange={(e) => set("area_cnpq_codigo", e.target.value)}
          />
        </Field>
        <Field label="Nome da área CNPq *">
          <input
            className={inputCls}
            value={(value.area_cnpq_nome as string) ?? ""}
            onChange={(e) => set("area_cnpq_nome", e.target.value)}
          />
        </Field>
      </div>
      <Field label="Plano de trabalho *">
        <textarea
          className={inputCls + " min-h-[100px]"}
          value={(value.plano_trabalho as string) ?? ""}
          onChange={(e) => set("plano_trabalho", e.target.value)}
        />
      </Field>
      <div className="border-l-2 border-primary pl-4 space-y-4">
        <div className="text-xs uppercase tracking-[0.06em] text-primary font-semibold">
          Produtos esperados
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Publicações">
            <input
              type="number"
              className={inputCls}
              value={(produtos.publicacoes as number) ?? 0}
              onChange={(e) =>
                setNested("produtos_esperados", "publicacoes", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Apresentação em seminário">
            <select
              className={inputCls}
              value={produtos.apresentacao_seminario ? "sim" : "nao"}
              onChange={(e) =>
                setNested(
                  "produtos_esperados",
                  "apresentacao_seminario",
                  e.target.value === "sim",
                )
              }
            >
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </select>
          </Field>
        </div>
      </div>
    </div>
  );
}

// -------------------- PD_EMBRAPII --------------------
function EmbrapiiFields({
  value,
  set,
  setNested,
}: {
  value: Meta;
  set: (k: string, v: unknown) => void;
  setNested: (p: string, k: string, v: unknown) => void;
}) {
  const empresa = (value.empresa_parceira as Record<string, unknown>) ?? {};
  return (
    <div className="space-y-5">
      <div className="border-l-2 border-primary pl-4 space-y-4">
        <div className="text-xs uppercase tracking-[0.06em] text-primary font-semibold">
          Empresa parceira
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Razão social *">
            <input
              className={inputCls}
              value={(empresa.razao_social as string) ?? ""}
              onChange={(e) => setNested("empresa_parceira", "razao_social", e.target.value)}
            />
          </Field>
          <Field label="CNPJ *">
            <input
              className={inputCls}
              value={(empresa.cnpj as string) ?? ""}
              onChange={(e) => setNested("empresa_parceira", "cnpj", e.target.value)}
              placeholder="00.000.000/0000-00"
            />
          </Field>
        </div>
        <Field label="Porte *">
          <select
            className={inputCls}
            value={(empresa.porte as string) ?? ""}
            onChange={(e) => setNested("empresa_parceira", "porte", e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="micro">Micro</option>
            <option value="pequena">Pequena</option>
            <option value="media">Média</option>
            <option value="grande">Grande</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="TRL inicial *" hint="1-9">
          <input
            type="number"
            min={1}
            max={9}
            className={inputCls}
            value={(value.trl_inicial as number) ?? ""}
            onChange={(e) => set("trl_inicial", Number(e.target.value))}
          />
        </Field>
        <Field label="TRL alvo *" hint="1-9">
          <input
            type="number"
            min={1}
            max={9}
            className={inputCls}
            value={(value.trl_alvo as number) ?? ""}
            onChange={(e) => set("trl_alvo", Number(e.target.value))}
          />
        </Field>
        <Field label="Área tecnológica *">
          <input
            className={inputCls}
            value={(value.area_tecnologica as string) ?? ""}
            onChange={(e) => set("area_tecnologica", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Valor total (R$)">
          <input
            type="number"
            className={inputCls}
            value={(value.valor_total as number) ?? ""}
            onChange={(e) => set("valor_total", Number(e.target.value))}
          />
        </Field>
        <Field label="Contrapartida empresa (R$)">
          <input
            type="number"
            className={inputCls}
            value={(value.valor_contrapartida_empresa as number) ?? ""}
            onChange={(e) =>
              set("valor_contrapartida_empresa", Number(e.target.value))
            }
          />
        </Field>
        <Field label="Valor EMBRAPII (R$)">
          <input
            type="number"
            className={inputCls}
            value={(value.valor_embrapii as number) ?? ""}
            onChange={(e) => set("valor_embrapii", Number(e.target.value))}
          />
        </Field>
        <Field label="Valor unidade (R$)">
          <input
            type="number"
            className={inputCls}
            value={(value.valor_unidade as number) ?? ""}
            onChange={(e) => set("valor_unidade", Number(e.target.value))}
          />
        </Field>
      </div>
    </div>
  );
}

// -------------------- OUTRO --------------------
function OutroFields({
  value,
  set,
}: {
  value: Meta;
  set: (k: string, v: unknown) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="p-4 bg-accent-tint border border-accent rounded-lg text-xs text-[#7A4900]">
        <strong>Tipo livre.</strong> Apenas <code>descricao_programa</code> é
        obrigatório — os demais campos podem ser adicionados conforme a
        necessidade. Demonstra o uso de <code>passthrough()</code> no Zod e da
        flexibilidade do <code>Schema.Types.Mixed</code> no Mongoose.
      </div>
      <Field label="Descrição do programa *">
        <textarea
          className={inputCls + " min-h-[100px]"}
          value={(value.descricao_programa as string) ?? ""}
          onChange={(e) => set("descricao_programa", e.target.value)}
        />
      </Field>
    </div>
  );
}
