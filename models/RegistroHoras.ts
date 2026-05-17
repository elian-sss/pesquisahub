import { Schema, model, models, type Model, type Types } from "mongoose";
import {
  STATUS_REGISTRO_HORAS,
  TIPOS_HORAS,
  type StatusRegistroHoras,
  type TipoHoras,
} from "@/types";

interface Aprovacao {
  aprovador_id: Types.ObjectId;
  aprovado_em: Date;
  observacao?: string;
}

export interface RegistroHoras {
  // refs manuais
  projeto_id: Types.ObjectId;
  usuario_id: Types.ObjectId;
  // referencia ao cronograma._id dentro do projeto pai (sem populate possivel)
  meta_id?: Types.ObjectId;
  data: Date;
  horas: number;
  atividade: string;
  tipo: TipoHoras;
  status: StatusRegistroHoras;
  aprovacao?: Aprovacao;
  criado_em: Date;
}

const aprovacaoSchema = new Schema<Aprovacao>(
  {
    aprovador_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    aprovado_em: { type: Date, required: true, default: Date.now },
    observacao: String,
  },
  { _id: false },
);

// Colecao propria (e nao embed) porque registros crescem sem limite por projeto.
const registroHorasSchema = new Schema<RegistroHoras>(
  {
    projeto_id: { type: Schema.Types.ObjectId, ref: "Projeto", required: true },
    usuario_id: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    meta_id: { type: Schema.Types.ObjectId },
    data: { type: Date, required: true },
    horas: { type: Number, required: true, min: 0 },
    atividade: { type: String, required: true },
    tipo: { type: String, enum: TIPOS_HORAS, required: true },
    status: { type: String, enum: STATUS_REGISTRO_HORAS, default: "pendente" },
    aprovacao: aprovacaoSchema,
  },
  {
    timestamps: { createdAt: "criado_em", updatedAt: false },
    collection: "registros_horas",
  },
);

registroHorasSchema.index({ projeto_id: 1, data: -1 });
registroHorasSchema.index({ usuario_id: 1, data: -1 });
registroHorasSchema.index({ status: 1, projeto_id: 1 });

export const RegistroHorasModel: Model<RegistroHoras> =
  (models.RegistroHoras as Model<RegistroHoras>) ||
  model<RegistroHoras>("RegistroHoras", registroHorasSchema);
