import { Schema, model, models, type Model, type Types } from "mongoose";

interface MetadataArquivo {
  hash_sha256?: string;
  num_paginas?: number;
  versao?: number;
  // ref manual para a versao antiga (chain de versionamento)
  versao_anterior_id?: Types.ObjectId;
}

interface VinculadoA {
  // referencias para subdocumentos dentro de Projeto.cronograma
  meta_id?: Types.ObjectId;
  entrega_id?: Types.ObjectId;
}

export interface Arquivo {
  projeto_id: Types.ObjectId;
  enviado_por: Types.ObjectId;
  nome: string;
  tipo_documento: string;
  mime_type: string;
  tamanho_bytes: number;
  url_storage: string;
  metadata_arquivo?: MetadataArquivo;
  vinculado_a?: VinculadoA;
  tags?: string[];
  enviado_em: Date;
}

const metadataArquivoSchema = new Schema<MetadataArquivo>(
  {
    hash_sha256: String,
    num_paginas: Number,
    versao: Number,
    versao_anterior_id: { type: Schema.Types.ObjectId, ref: "Arquivo" },
  },
  { _id: false },
);

const vinculadoASchema = new Schema<VinculadoA>(
  {
    meta_id: Schema.Types.ObjectId,
    entrega_id: Schema.Types.ObjectId,
  },
  { _id: false },
);

// Colecao propria por motivos de tamanho e ciclo de vida independente do projeto.
const arquivoSchema = new Schema<Arquivo>(
  {
    projeto_id: { type: Schema.Types.ObjectId, ref: "Projeto", required: true },
    enviado_por: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    nome: { type: String, required: true },
    tipo_documento: { type: String, required: true },
    mime_type: { type: String, required: true },
    tamanho_bytes: { type: Number, required: true },
    url_storage: { type: String, required: true },
    metadata_arquivo: metadataArquivoSchema,
    vinculado_a: vinculadoASchema,
    tags: { type: [String], default: undefined },
  },
  {
    timestamps: { createdAt: "enviado_em", updatedAt: false },
    collection: "arquivos",
  },
);

arquivoSchema.index({ projeto_id: 1, tipo_documento: 1 });
arquivoSchema.index({ "vinculado_a.meta_id": 1 }, { sparse: true });

export const ArquivoModel: Model<Arquivo> =
  (models.Arquivo as Model<Arquivo>) || model<Arquivo>("Arquivo", arquivoSchema);
