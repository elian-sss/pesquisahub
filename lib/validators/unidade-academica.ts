import { z } from "zod";
import { TIPOS_UNIDADE_ACADEMICA } from "@/types";

export const unidadeAcademicaCreateSchema = z.object({
  sigla: z.string().min(1).toUpperCase(),
  nome: z.string().min(2),
  campus: z.string().min(1),
  tipo: z.enum(TIPOS_UNIDADE_ACADEMICA),
});
export type UnidadeAcademicaCreateInput = z.infer<
  typeof unidadeAcademicaCreateSchema
>;
