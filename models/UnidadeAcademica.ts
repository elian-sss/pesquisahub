import { Schema, model, models, type Model } from "mongoose";
import { TIPOS_UNIDADE_ACADEMICA, type TipoUnidadeAcademica } from "@/types";

export interface UnidadeAcademica {
  sigla: string;
  nome: string;
  campus: string;
  tipo: TipoUnidadeAcademica;
}

const unidadeAcademicaSchema = new Schema<UnidadeAcademica>(
  {
    sigla: { type: String, required: true, unique: true, uppercase: true, trim: true },
    nome: { type: String, required: true },
    campus: { type: String, required: true },
    tipo: { type: String, enum: TIPOS_UNIDADE_ACADEMICA, required: true },
  },
  { collection: "unidades_academicas" },
);

// sigla ja tem `unique: true` na declaracao do campo.

export const UnidadeAcademicaModel: Model<UnidadeAcademica> =
  (models.UnidadeAcademica as Model<UnidadeAcademica>) ||
  model<UnidadeAcademica>("UnidadeAcademica", unidadeAcademicaSchema);
