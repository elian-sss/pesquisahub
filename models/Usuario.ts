import { Schema, model, models, type Model, type Types } from "mongoose";
import { CATEGORIAS, ROLES, type Categoria, type Role } from "@/types";

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
  },
  {
    timestamps: { createdAt: "criado_em", updatedAt: "atualizado_em" },
    collection: "usuarios",
  },
);

// email ja tem `unique: true` na declaracao do campo (evita warning de duplicado).
usuarioSchema.index({ matricula: 1 }, { sparse: true, unique: true });
usuarioSchema.index({ role: 1 });

export const UsuarioModel: Model<Usuario> =
  (models.Usuario as Model<Usuario>) || model<Usuario>("Usuario", usuarioSchema);
