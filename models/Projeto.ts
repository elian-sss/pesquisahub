import { Schema, model, models, type Model, type Types } from "mongoose";
import {
  PAPEIS_EQUIPE,
  STATUS_ENTREGA,
  STATUS_META,
  STATUS_PROJETO,
  TIPOS_PROJETO,
  TIPOS_VINCULO,
  type MetadadosPrograma,
  type PapelEquipe,
  type StatusEntrega,
  type StatusMeta,
  type StatusProjeto,
  type TipoProjeto,
  type TipoVinculo,
} from "@/types";

interface Prorrogacao {
  nova_data_fim: Date;
  motivo: string;
  registrado_em: Date;
}

interface Vigencia {
  inicio: Date;
  fim: Date;
  prorrogacoes: Prorrogacao[];
}

interface PeriodoEquipe {
  inicio: Date;
  fim?: Date;
}

interface MembroEquipe {
  // ref manual -> usuarios
  usuario_id: Types.ObjectId;
  // nome desnormalizado: evita um populate em toda listagem de projeto.
  nome: string;
  papel: PapelEquipe;
  categoria: string;
  tipo_vinculo?: TipoVinculo;
  valor_bolsa?: number;
  carga_horaria_semanal?: number;
  periodo: PeriodoEquipe;
}

interface Entrega {
  _id?: Types.ObjectId;
  descricao: string;
  status: StatusEntrega;
  responsavel_id?: Types.ObjectId;
  arquivo_id?: Types.ObjectId;
}

interface Meta {
  _id?: Types.ObjectId;
  titulo: string;
  prazo: Date;
  status: StatusMeta;
  concluido_em?: Date;
  entregas: Entrega[];
}

interface RecursoExtra {
  nome: string;
  url: string;
  tipo: string;
}

interface Recursos {
  repositorio_git?: string;
  drive?: string;
  outros: RecursoExtra[];
}

export interface Projeto {
  titulo: string;
  descricao: string;
  tipo: TipoProjeto;
  status: StatusProjeto;
  sigaa_id?: string;
  programa_id: Types.ObjectId;
  unidade_academica_id: Types.ObjectId;
  campus: string;
  vigencia: Vigencia;
  equipe: MembroEquipe[];
  cronograma: Meta[];
  metadados_programa: MetadadosPrograma;
  recursos: Recursos;
  criado_em: Date;
  atualizado_em: Date;
}

const prorrogacaoSchema = new Schema<Prorrogacao>(
  {
    nova_data_fim: { type: Date, required: true },
    motivo: { type: String, required: true },
    registrado_em: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const vigenciaSchema = new Schema<Vigencia>(
  {
    inicio: { type: Date, required: true },
    fim: { type: Date, required: true },
    prorrogacoes: { type: [prorrogacaoSchema], default: [] },
  },
  { _id: false },
);

const periodoEquipeSchema = new Schema<PeriodoEquipe>(
  { inicio: { type: Date, required: true }, fim: Date },
  { _id: false },
);

const membroEquipeSchema = new Schema<MembroEquipe>(
  {
    usuario_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    nome: { type: String, required: true },
    papel: { type: String, enum: PAPEIS_EQUIPE, required: true },
    categoria: { type: String, required: true },
    tipo_vinculo: { type: String, enum: TIPOS_VINCULO },
    valor_bolsa: Number,
    carga_horaria_semanal: Number,
    periodo: { type: periodoEquipeSchema, required: true },
  },
  { _id: false },
);

// Entregas e metas tem _id proprio para que registros_horas.meta_id
// e arquivos.vinculado_a.{meta_id,entrega_id} possam referencia-las.
const entregaSchema = new Schema<Entrega>({
  descricao: { type: String, required: true },
  status: { type: String, enum: STATUS_ENTREGA, default: "pendente" },
  responsavel_id: { type: Schema.Types.ObjectId, ref: "Usuario" },
  arquivo_id: { type: Schema.Types.ObjectId, ref: "Arquivo" },
});

const metaSchema = new Schema<Meta>({
  titulo: { type: String, required: true },
  prazo: { type: Date, required: true },
  status: { type: String, enum: STATUS_META, default: "planejado" },
  concluido_em: Date,
  entregas: { type: [entregaSchema], default: [] },
});

const recursoExtraSchema = new Schema<RecursoExtra>(
  {
    nome: { type: String, required: true },
    url: { type: String, required: true },
    tipo: { type: String, required: true },
  },
  { _id: false },
);

const recursosSchema = new Schema<Recursos>(
  {
    repositorio_git: String,
    drive: String,
    outros: { type: [recursoExtraSchema], default: [] },
  },
  { _id: false },
);

const projetoSchema = new Schema<Projeto>(
  {
    titulo: { type: String, required: true, trim: true },
    descricao: { type: String, required: true },
    tipo: { type: String, enum: TIPOS_PROJETO, required: true },
    status: { type: String, enum: STATUS_PROJETO, default: "planejado" },
    sigaa_id: String,
    // refs manuais
    programa_id: { type: Schema.Types.ObjectId, ref: "Programa", required: true },
    unidade_academica_id: {
      type: Schema.Types.ObjectId,
      ref: "UnidadeAcademica",
      required: true,
    },
    campus: { type: String, required: true },
    vigencia: { type: vigenciaSchema, required: true },
    // equipe embedada como historico de participacao no projeto.
    equipe: { type: [membroEquipeSchema], default: [] },
    // cronograma com entregas aninhadas — leitura sempre acompanha o projeto.
    cronograma: { type: [metaSchema], default: [] },
    // metadados_programa: forma varia por tipo do projeto.
    // Validacao por discriminated union acontece na camada Zod (Fase 3),
    // mantendo o documento aberto a evoluir sem migration.
    metadados_programa: { type: Schema.Types.Mixed, required: true },
    recursos: { type: recursosSchema, default: () => ({ outros: [] }) },
  },
  {
    timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" },
    collection: "projetos",
  },
);

// Indices essenciais — usar nas agregacoes do dashboard.
// Cada agregacao deve comentar qual destes ela aproveita (CLAUDE.md).
projetoSchema.index({ tipo: 1, status: 1 });
projetoSchema.index({ programa_id: 1 });
projetoSchema.index({ unidade_academica_id: 1, campus: 1 });
projetoSchema.index({ "equipe.usuario_id": 1 });
projetoSchema.index({ "vigencia.fim": 1, status: 1 });
projetoSchema.index({ sigaa_id: 1 }, { sparse: true });
// Indices sparse em campos de metadados_programa — so existem em alguns tipos.
projetoSchema.index({ "metadados_programa.unidade_demandante": 1 }, { sparse: true });
projetoSchema.index({ "metadados_programa.semestre_letivo": 1 }, { sparse: true });

export const ProjetoModel: Model<Projeto> =
  (models.Projeto as Model<Projeto>) || model<Projeto>("Projeto", projetoSchema);
