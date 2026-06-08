import { Schema, model, models, type Model, type Types } from "mongoose";
import {
  CATEGORIAS,
  ROLES,
  STATUS_REGISTRO_HORAS,
  TIPOS_HORAS,
  type Categoria,
  type Role,
  type StatusRegistroHoras,
  type TipoHoras,
} from "@/types";

interface Contato {
  telefone?: string;
  telefone_emergencia?: string;
}

interface Endereco {
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

interface DadosBancarios {
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo?: "corrente" | "poupanca";
}

interface Academico {
  lattes?: string;
  orcid?: string;
  semestre_ingresso?: string;
  previsao_conclusao?: string;
}

interface Preferencias {
  notificacoes_email: boolean;
  notificacoes_sistema: boolean;
  tema: "claro" | "escuro";
}

interface Aprovacao {
  // ref manual -> usuarios (quem aprovou)
  aprovador_id: Types.ObjectId;
  aprovado_em: Date;
  observacao?: string;
}

// Antes era coleção própria; agora embedado no usuário a pedido da disciplina.
// _id proprio em cada registro permite aprovar/rejeitar um item via positional `$`.
export interface RegistroHoras {
  _id?: Types.ObjectId;
  // ref manual -> projetos (registro pertence a um projeto)
  projeto_id: Types.ObjectId;
  // ref ao cronograma._id dentro do projeto (sem populate possivel)
  meta_id?: Types.ObjectId;
  data: Date;
  horas: number;
  atividade: string;
  tipo: TipoHoras;
  status: StatusRegistroHoras;
  aprovacao?: Aprovacao;
  criado_em: Date;
}

export interface Usuario {
  nome: string;
  email: string;
  senha_hash: string;
  role: Role;
  categoria: Categoria;
  matricula?: string;
  curso?: string;
  // ref manual -> unidades_academicas (MongoDB nao tem FK; integridade fica no codigo)
  unidade_academica_id?: Types.ObjectId;
  campus?: string;
  contato?: Contato;
  endereco?: Endereco;
  dados_bancarios?: DadosBancarios;
  academico?: Academico;
  preferencias?: Preferencias;
  // Registros de horas embedados (historico de apontamentos da pessoa).
  registros_horas: RegistroHoras[];
  criado_em: Date;
  atualizado_em: Date;
}

// Subdocumentos embedados — pertencem a pessoa e sao lidos junto com ela.
const contatoSchema = new Schema<Contato>(
  { telefone: String, telefone_emergencia: String },
  { _id: false },
);

const enderecoSchema = new Schema<Endereco>(
  {
    logradouro: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String,
  },
  { _id: false },
);

const dadosBancariosSchema = new Schema<DadosBancarios>(
  {
    banco: String,
    agencia: String,
    conta: String,
    tipo: { type: String, enum: ["corrente", "poupanca"] },
  },
  { _id: false },
);

const academicoSchema = new Schema<Academico>(
  {
    lattes: String,
    orcid: String,
    semestre_ingresso: String,
    previsao_conclusao: String,
  },
  { _id: false },
);

const preferenciasSchema = new Schema<Preferencias>(
  {
    notificacoes_email: { type: Boolean, default: true },
    notificacoes_sistema: { type: Boolean, default: true },
    tema: { type: String, enum: ["claro", "escuro"], default: "claro" },
  },
  { _id: false },
);

const aprovacaoSchema = new Schema<Aprovacao>(
  {
    aprovador_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    aprovado_em: { type: Date, required: true, default: Date.now },
    observacao: String,
  },
  { _id: false },
);

// Registro de horas embedado — mantem _id proprio para aprovacao individual.
// Trade-off assumido: o array e unbounded (cresce sem limite por pessoa);
// embedado a pedido da disciplina para demonstrar embedding vs referencing.
const registroHorasSchema = new Schema<RegistroHoras>(
  {
    projeto_id: { type: Schema.Types.ObjectId, ref: "Projeto", required: true },
    meta_id: { type: Schema.Types.ObjectId },
    data: { type: Date, required: true },
    horas: { type: Number, required: true, min: 0 },
    atividade: { type: String, required: true },
    tipo: { type: String, enum: TIPOS_HORAS, required: true },
    status: { type: String, enum: STATUS_REGISTRO_HORAS, default: "pendente" },
    aprovacao: aprovacaoSchema,
    criado_em: { type: Date, required: true, default: Date.now },
  },
  { _id: true },
);

const usuarioSchema = new Schema<Usuario>(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select:false esconde o hash em queries normais; precisa de .select('+senha_hash') para o login.
    senha_hash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    categoria: { type: String, enum: CATEGORIAS, required: true },
    matricula: { type: String, trim: true },
    curso: String,
    unidade_academica_id: { type: Schema.Types.ObjectId, ref: "UnidadeAcademica" },
    campus: String,
    contato: contatoSchema,
    endereco: enderecoSchema,
    dados_bancarios: dadosBancariosSchema,
    academico: academicoSchema,
    preferencias: preferenciasSchema,
    registros_horas: { type: [registroHorasSchema], default: [] },
  },
  {
    timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" },
    collection: "usuarios",
  },
);

// email ja tem `unique: true` na declaracao do campo (evita warning de duplicado).
usuarioSchema.index({ matricula: 1 }, { sparse: true, unique: true });
usuarioSchema.index({ role: 1 });
// Indices multikey sobre o array embedado de horas. Substituem os indices
// que viviam na antiga colecao registros_horas. Aproveitados nas agregacoes
// de horas pendentes (por status) e por projeto (aba Horas / dashboard).
usuarioSchema.index({ "registros_horas.projeto_id": 1 });
usuarioSchema.index({ "registros_horas.status": 1 });

export const UsuarioModel: Model<Usuario> =
  (models.Usuario as Model<Usuario>) || model<Usuario>("Usuario", usuarioSchema);
