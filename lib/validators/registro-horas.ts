import { z } from "zod";
import { STATUS_REGISTRO_HORAS, TIPOS_HORAS } from "@/types";
import { objectIdString } from "./embeds";

export const registroHorasCreateSchema = z.object({
  projeto_id: objectIdString,
  meta_id: objectIdString.optional(),
  data: z.coerce.date(),
  horas: z.number().positive().max(24),
  atividade: z.string().min(1),
  tipo: z.enum(TIPOS_HORAS),
});
export type RegistroHorasCreateInput = z.infer<typeof registroHorasCreateSchema>;

export const registroHorasAprovacaoSchema = z.object({
  registro_id: objectIdString,
  status: z.enum(STATUS_REGISTRO_HORAS).refine(
    (s): s is "aprovado" | "rejeitado" => s !== "pendente",
    { message: "Status de aprovacao deve ser aprovado ou rejeitado" },
  ),
  observacao: z.string().optional(),
});
export type RegistroHorasAprovacaoInput = z.infer<
  typeof registroHorasAprovacaoSchema
>;
