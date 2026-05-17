import { z } from "zod";
import { NATUREZAS_PROGRAMA, TIPOS_PROJETO } from "@/types";
import {
  contatoResponsavelSchema,
  modalidadeBolsaSchema,
  regulamentoSchema,
  requisitosSchema,
} from "./embeds";

export const programaCreateSchema = z.object({
  sigla: z.string().min(1).toUpperCase(),
  nome_completo: z.string().min(2),
  tipo: z.enum(TIPOS_PROJETO),
  pro_reitoria: z.string().min(1),
  natureza: z.enum(NATUREZAS_PROGRAMA),
  site: z.string().url().optional().or(z.literal("")),
  modalidades_bolsa: z.array(modalidadeBolsaSchema).default([]),
  regulamento: regulamentoSchema.optional(),
  contato_responsavel: contatoResponsavelSchema.optional(),
  requisitos: requisitosSchema.optional(),
  ativo: z.boolean().default(true),
});
export type ProgramaCreateInput = z.infer<typeof programaCreateSchema>;

export const programaUpdateSchema = programaCreateSchema.partial();
export type ProgramaUpdateInput = z.infer<typeof programaUpdateSchema>;
