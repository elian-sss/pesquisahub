"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { TIPOS_PROJETO, PAPEIS_EQUIPE, type TipoProjeto } from "@/types";
import { criarProjeto } from "@/lib/actions/projetos";
import { MetadadosProgramaFields } from "./metadados-fields";

interface SelectOption {
  _id: string;
  nome?: string;
  sigla?: string;
  nome_completo?: string;
  campus?: string;
  tipo?: string;
  role?: string;
  categoria?: string;
}

type FormState = {
  titulo: string;
  descricao: string;
  tipo: TipoProjeto | "";
  programa_id: string;
  unidade_academica_id: string;
  campus: string;
  vigencia_inicio: string;
  vigencia_fim: string;
  sigaa_id: string;
  equipe: Array<{
    usuario_id: string;
    nome: string;
    papel: (typeof PAPEIS_EQUIPE)[number];
    categoria: string;
    carga_horaria_semanal?: number;
  }>;
  metadados: Record<string, unknown>;
};

const STEPS = ["Dados básicos", "Fomento", "Metadados", "Equipe", "Revisão"] as const;

export function NovoProjetoForm({
  programas,
  unidades,
  usuarios,
}: {
  programas: SelectOption[];
  unidades: SelectOption[];
  usuarios: SelectOption[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<FormState>({
    titulo: "",
    descricao: "",
    tipo: "",
    programa_id: "",
    unidade_academica_id: "",
    campus: "Tapajós",
    vigencia_inicio: "",
    vigencia_fim: "",
    sigaa_id: "",
    equipe: [],
    metadados: {},
  });

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const canAdvance = () => {
    if (step === 0) return state.titulo.length >= 2 && state.descricao.length > 0 && state.tipo;
    if (step === 1)
      return state.programa_id && state.unidade_academica_id && state.vigencia_inicio && state.vigencia_fim;
    if (step === 2) return Object.keys(state.metadados).length > 0;
    if (step === 3) return state.equipe.length > 0;
    return true;
  };

  const submit = () => {
    startTransition(async () => {
      const payload = {
        titulo: state.titulo,
        descricao: state.descricao,
        tipo: state.tipo,
        programa_id: state.programa_id,
        unidade_academica_id: state.unidade_academica_id,
        campus: state.campus,
        status: "planejado" as const,
        sigaa_id: state.sigaa_id || undefined,
        vigencia: {
          inicio: new Date(state.vigencia_inicio),
          fim: new Date(state.vigencia_fim),
          prorrogacoes: [],
        },
        equipe: state.equipe.map((m) => ({
          ...m,
          periodo: { inicio: new Date(state.vigencia_inicio) },
        })),
        cronograma: [],
        metadados_programa: state.metadados,
        recursos: { outros: [] },
      };
      const res = await criarProjeto(payload);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Projeto criado!");
      router.push(`/projetos/${res.data.id}`);
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border rounded-xl p-5">
        <div className="serif text-xl font-medium tracking-[-0.015em] mb-1">
          Novo projeto
        </div>
        <div className="text-sm text-muted-foreground">
          Cadastro em {STEPS.length} passos · os campos do passo 3 mudam de acordo com o tipo
        </div>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1 flex items-center gap-2">
            <div
              className={
                "w-7 h-7 rounded-full grid place-items-center text-xs font-semibold flex-shrink-0 " +
                (i < step
                  ? "bg-[color:var(--ok)] text-white"
                  : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-line-2 text-muted-foreground")
              }
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <div className="hidden sm:block text-xs font-medium flex-1 truncate">
              {label}
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-border hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-6 min-h-[400px]">
        {step === 0 && (
          <Step1 state={state} update={update} />
        )}
        {step === 1 && (
          <Step2
            state={state}
            update={update}
            programas={programas}
            unidades={unidades}
          />
        )}
        {step === 2 && state.tipo && (
          <div>
            <SectionHeader
              title={`Metadados — ${state.tipo}`}
              sub="Estes campos são salvos como Schema.Types.Mixed e variam por tipo de projeto."
            />
            <MetadadosProgramaFields
              tipo={state.tipo}
              value={state.metadados}
              onChange={(meta) => update("metadados", meta)}
            />
          </div>
        )}
        {step === 3 && (
          <Step4 state={state} update={update} usuarios={usuarios} />
        )}
        {step === 4 && <Step5 state={state} />}
      </div>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 0 || pending}
          className="inline-flex items-center gap-1.5 px-4 py-2 border rounded-lg text-sm hover:bg-line-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={14} /> Voltar
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canAdvance()}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-[color:var(--primary-deep)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próximo <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-accent text-[#1A1A1A] rounded-lg text-sm font-semibold hover:bg-[#d9a52d] disabled:opacity-50"
          >
            {pending ? "Salvando..." : "Cadastrar projeto"}
          </button>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-5">
      <div className="serif text-lg font-semibold tracking-[-0.01em]">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

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

const inputCls =
  "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

function Step1({
  state,
  update,
}: {
  state: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionHeader title="Dados básicos" sub="Identificação do projeto" />
      <Field label="Título *">
        <input
          className={inputCls}
          value={state.titulo}
          onChange={(e) => update("titulo", e.target.value)}
          placeholder="Ex.: Sensor IoT para monitoramento de igarapés"
        />
      </Field>
      <Field label="Descrição *">
        <textarea
          className={inputCls + " min-h-[120px]"}
          value={state.descricao}
          onChange={(e) => update("descricao", e.target.value)}
          placeholder="Resumo do projeto, objetivos, impacto esperado"
        />
      </Field>
      <Field label="Tipo do projeto *" hint="Define os campos específicos do passo 3">
        <select
          className={inputCls}
          value={state.tipo}
          onChange={(e) => {
            update("tipo", e.target.value as TipoProjeto);
            update("metadados", {});
          }}
        >
          <option value="">Selecione um tipo</option>
          {TIPOS_PROJETO.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}

function Step2({
  state,
  update,
  programas,
  unidades,
}: {
  state: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  programas: SelectOption[];
  unidades: SelectOption[];
}) {
  const programasFiltrados = state.tipo
    ? programas.filter((p) => p.tipo === state.tipo)
    : programas;
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Fomento e vínculo"
        sub="Programa, unidade acadêmica e vigência"
      />
      <Field label="Programa de fomento *">
        <select
          className={inputCls}
          value={state.programa_id}
          onChange={(e) => update("programa_id", e.target.value)}
        >
          <option value="">Selecione um programa</option>
          {programasFiltrados.map((p) => (
            <option key={p._id} value={p._id}>
              {p.sigla} — {p.nome_completo}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Unidade acadêmica *">
          <select
            className={inputCls}
            value={state.unidade_academica_id}
            onChange={(e) => update("unidade_academica_id", e.target.value)}
          >
            <option value="">Selecione</option>
            {unidades.map((u) => (
              <option key={u._id} value={u._id}>
                {u.sigla} — {u.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Campus *">
          <input
            className={inputCls}
            value={state.campus}
            onChange={(e) => update("campus", e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Início da vigência *">
          <input
            type="date"
            className={inputCls}
            value={state.vigencia_inicio}
            onChange={(e) => update("vigencia_inicio", e.target.value)}
          />
        </Field>
        <Field label="Fim da vigência *">
          <input
            type="date"
            className={inputCls}
            value={state.vigencia_fim}
            onChange={(e) => update("vigencia_fim", e.target.value)}
          />
        </Field>
      </div>
      <Field label="ID SIGAA" hint="Opcional — integração com sistema acadêmico">
        <input
          className={inputCls}
          value={state.sigaa_id}
          onChange={(e) => update("sigaa_id", e.target.value)}
          placeholder="Ex.: 2025-001234"
        />
      </Field>
    </div>
  );
}

function Step4({
  state,
  update,
  usuarios,
}: {
  state: FormState;
  update: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  usuarios: SelectOption[];
}) {
  const addMembro = (usuario_id: string) => {
    const u = usuarios.find((x) => x._id === usuario_id);
    if (!u) return;
    if (state.equipe.some((m) => m.usuario_id === usuario_id)) return;
    update("equipe", [
      ...state.equipe,
      {
        usuario_id,
        nome: u.nome ?? "",
        papel: state.equipe.length === 0 ? "coordenador" : "bolsista",
        categoria: u.categoria ?? "externo",
      },
    ]);
  };

  const removeMembro = (usuario_id: string) =>
    update(
      "equipe",
      state.equipe.filter((m) => m.usuario_id !== usuario_id),
    );

  const updatePapel = (
    usuario_id: string,
    papel: (typeof PAPEIS_EQUIPE)[number],
  ) =>
    update(
      "equipe",
      state.equipe.map((m) => (m.usuario_id === usuario_id ? { ...m, papel } : m)),
    );

  return (
    <div className="space-y-5">
      <SectionHeader title="Equipe inicial" sub="Adicione coordenador e bolsistas" />
      <Field label="Adicionar membro">
        <select
          className={inputCls}
          value=""
          onChange={(e) => addMembro(e.target.value)}
        >
          <option value="">Selecione uma pessoa</option>
          {usuarios
            .filter((u) => !state.equipe.some((m) => m.usuario_id === u._id))
            .map((u) => (
              <option key={u._id} value={u._id}>
                {u.nome} ({u.role})
              </option>
            ))}
        </select>
      </Field>

      <div className="border rounded-lg divide-y">
        {state.equipe.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground text-center">
            Nenhum membro adicionado ainda. Pelo menos um é necessário.
          </div>
        )}
        {state.equipe.map((m) => (
          <div key={m.usuario_id} className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="font-medium text-sm">{m.nome}</div>
              <div className="text-xs text-muted-foreground">{m.categoria}</div>
            </div>
            <select
              className={inputCls + " w-auto"}
              value={m.papel}
              onChange={(e) =>
                updatePapel(
                  m.usuario_id,
                  e.target.value as (typeof PAPEIS_EQUIPE)[number],
                )
              }
            >
              {PAPEIS_EQUIPE.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeMembro(m.usuario_id)}
              className="text-xs text-[color:var(--bad)] hover:underline"
            >
              Remover
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step5({ state }: { state: FormState }) {
  return (
    <div className="space-y-5">
      <SectionHeader title="Revisão" sub="Confira antes de salvar" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Pair label="Título" value={state.titulo} />
        <Pair label="Tipo" value={state.tipo} />
        <Pair label="Campus" value={state.campus} />
        <Pair
          label="Vigência"
          value={`${state.vigencia_inicio} → ${state.vigencia_fim}`}
        />
        <div className="col-span-full">
          <div className="text-xs uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1">
            Descrição
          </div>
          <div>{state.descricao}</div>
        </div>
        <div className="col-span-full">
          <div className="text-xs uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1">
            Equipe
          </div>
          <ul className="list-disc list-inside text-sm">
            {state.equipe.map((m) => (
              <li key={m.usuario_id}>
                {m.nome} — {m.papel}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-full">
          <div className="text-xs uppercase tracking-[0.06em] text-muted-foreground font-medium mb-1">
            Metadados — {state.tipo}
          </div>
          <pre className="text-xs bg-[#FBFAF6] border rounded-lg p-3 overflow-auto">
            {JSON.stringify(state.metadados, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.06em] text-muted-foreground font-medium mb-0.5">
        {label}
      </div>
      <div>{value || "—"}</div>
    </div>
  );
}
