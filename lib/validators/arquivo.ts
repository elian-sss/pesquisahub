import { z } from "zod";
import { objectIdString } from "./embeds";

export const arquivoCreateSchema = z.object({
  projeto_id: objectIdString,
  nome: z.string().min(1),
  tipo_documento: z.string().min(1),
  mime_type: z.string().min(1),
  tamanho_bytes: z.number().int().nonnegative(),
  url_storage: z.string().min(1),
  metadata_arquivo: z
    .object({
      hash_sha256: z.string().optional(),
      num_paginas: z.number().int().positive().optional(),
      versao: z.number().int().positive().optional(),
      versao_anterior_id: objectIdString.optional(),
    })
    .optional(),
  vinculado_a: z
    .object({
      meta_id: objectIdString.optional(),
      entrega_id: objectIdString.optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
});
export type ArquivoCreateInput = z.infer<typeof arquivoCreateSchema>;
