import { Schema, model, models, type Model } from "mongoose";
import {
  NATUREZAS_PROGRAMA,
  TIPOS_PROJETO,
  type NaturezaPrograma,
  type TipoProjeto,
} from "@/types";

interface ModalidadeBolsa {
  nome: string;
  valor: number;
  agencia_pagadora?: string;
  duracao_meses?: number;
}

interface Regulamento {
  url_documento?: string;
  data_aprovacao?: Date;
  versao?: string;
}

interface ContatoResponsavel {
  nome?: string;
  email?: string;
  telefone?: string;
}

interface Requisitos {
  exige_lattes: boolean;
  exige_plano_trabalho: boolean;
  exige_relatorio_parcial: boolean;
  exige_relatorio_final: boolean;
  exige_apresentacao_seminario: boolean;
}

export interface Programa {
  sigla: string;
  nome_completo: string;
  tipo: TipoProjeto;
  pro_reitoria: string;
  natureza: NaturezaPrograma;
  site?: string;
  modalidades_bolsa: ModalidadeBolsa[];
  regulamento?: Regulamento;
  contato_responsavel?: ContatoResponsavel;
  requisitos?: Requisitos;
  ativo: boolean;
  criado_em: Date;
}

const modalidadeBolsaSchema = new Schema<ModalidadeBolsa>(
  {
    nome: { type: String, required: true },
    valor: { type: Number, required: true },
    agencia_pagadora: String,
    duracao_meses: Number,
  },
  { _id: false },
);

const regulamentoSchema = new Schema<Regulamento>(
  { url_documento: String, data_aprovacao: Date, versao: String },
  { _id: false },
);

const contatoResponsavelSchema = new Schema<ContatoResponsavel>(
  { nome: String, email: String, telefone: String },
  { _id: false },
);

const requisitosSchema = new Schema<Requisitos>(
  {
    exige_lattes: { type: Boolean, default: false },
    exige_plano_trabalho: { type: Boolean, default: false },
    exige_relatorio_parcial: { type: Boolean, default: false },
    exige_relatorio_final: { type: Boolean, default: false },
    exige_apresentacao_seminario: { type: Boolean, default: false },
  },
  { _id: false },
);

const programaSchema = new Schema<Programa>(
  {
    sigla: { type: String, required: true, unique: true, uppercase: true, trim: true },
    nome_completo: { type: String, required: true },
    tipo: { type: String, enum: TIPOS_PROJETO, required: true },
    pro_reitoria: { type: String, required: true },
    natureza: { type: String, enum: NATUREZAS_PROGRAMA, required: true },
    site: String,
    // Embed: lista pequena e estavel, sempre lida com o programa.
    modalidades_bolsa: { type: [modalidadeBolsaSchema], default: [] },
    regulamento: regulamentoSchema,
    contato_responsavel: contatoResponsavelSchema,
    requisitos: requisitosSchema,
    ativo: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "criado_em", updatedAt: false },
    collection: "programas",
  },
);

programaSchema.index({ sigla: 1 }, { unique: true });
programaSchema.index({ tipo: 1, ativo: 1 });

export const ProgramaModel: Model<Programa> =
  (models.Programa as Model<Programa>) || model<Programa>("Programa", programaSchema);
