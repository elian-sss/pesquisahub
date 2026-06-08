import { z } from "zod";
import {
  PAPEIS_EQUIPE,
  STATUS_ENTREGA,
  STATUS_META,
  STATUS_PROJETO,
  TIPOS_VINCULO,
} from "@/types";
import { objectIdString } from "./embeds";
import {
  embrapiiMetadadosSchema,
  monitoriaMetadadosSchema,
  outroMetadadosSchema,
  petMetadadosSchema,
  piapeMetadadosSchema,
  pibicMetadadosSchema,
} from "./metadados-programa";

const vigenciaSchema = z.object({
  inicio: z.coerce.date(),
  fim: z.coerce.date(),
  prorrogacoes: z
    .array(
      z.object({
        nova_data_fim: z.coerce.date(),
        motivo: z.string().min(1),
        registrado_em: z.coerce.date().default(() => new Date()),
      }),
    )
    .default([]),
});

const membroEquipeSchema = z.object({
  usuario_id: objectIdString,
  nome: z.string().min(1),
  papel: z.enum(PAPEIS_EQUIPE),
  categoria: z.string().min(1),
  tipo_vinculo: z.enum(TIPOS_VINCULO).optional(),
  valor_bolsa: z.number().nonnegative().optional(),
  carga_horaria_semanal: z.number().int().positive().optional(),
  periodo: z.object({
    inicio: z.coerce.date(),
    fim: z.coerce.date().optional(),
  }),
});

const entregaSchema = z.object({
  descricao: z.string().min(1),
  status: z.enum(STATUS_ENTREGA).default("pendente"),
  responsavel_id: objectIdString.optional(),
  arquivo_id: objectIdString.optional(),
});

const metaSchema = z.object({
  titulo: z.string().min(1),
  prazo: z.coerce.date(),
  status: z.enum(STATUS_META).default("planejado"),
  concluido_em: z.coerce.date().optional(),
  entregas: z.array(entregaSchema).default([]),
});

const recursosSchema = z.object({
  repositorio_git: z.string().url().optional().or(z.literal("")),
  drive: z.string().url().optional().or(z.literal("")),
  outros: z
    .array(
      z.object({
        nome: z.string().min(1),
        url: z.string().url(),
        tipo: z.string().min(1),
      }),
    )
    .default([]),
});

// `unidade_academica_id` sai do base porque a obrigatoriedade varia por tipo:
// PD_EMBRAPII (parceria com empresa) dispensa unidade academica; os demais exigem.
const projetoBase = z.object({
  titulo: z.string().min(2),
  descricao: z.string().min(1),
  status: z.enum(STATUS_PROJETO).default("planejado"),
  sigaa_id: z.string().optional(),
  programa_id: objectIdString,
  campus: z.string().min(1),
  vigencia: vigenciaSchema,
  equipe: z.array(membroEquipeSchema).default([]),
  cronograma: z.array(metaSchema).default([]),
  recursos: recursosSchema.default({ outros: [] }),
});

// Unidade obrigatoria para os tipos vinculados a uma unidade academica.
const unidadeObrigatoria = { unidade_academica_id: objectIdString };
// Unidade opcional apenas para PD_EMBRAPII.
const unidadeOpcional = { unidade_academica_id: objectIdString.optional() };

// Discriminated union conforme briefing: o `tipo` do projeto decide qual
// forma de metadados_programa e aceita. Validacao acontece num passo so.
export const projetoCreateSchema = z.discriminatedUnion("tipo", [
  projetoBase.extend({
    tipo: z.literal("MONITORIA"),
    ...unidadeObrigatoria,
    metadados_programa: monitoriaMetadadosSchema,
  }),
  projetoBase.extend({
    tipo: z.literal("PET"),
    ...unidadeObrigatoria,
    metadados_programa: petMetadadosSchema,
  }),
  projetoBase.extend({
    tipo: z.literal("PIAPE"),
    ...unidadeObrigatoria,
    metadados_programa: piapeMetadadosSchema,
  }),
  projetoBase.extend({
    tipo: z.literal("PIBIC"),
    ...unidadeObrigatoria,
    metadados_programa: pibicMetadadosSchema,
  }),
  projetoBase.extend({
    tipo: z.literal("PD_EMBRAPII"),
    ...unidadeOpcional,
    metadados_programa: embrapiiMetadadosSchema,
  }),
  projetoBase.extend({
    tipo: z.literal("OUTRO"),
    ...unidadeObrigatoria,
    metadados_programa: outroMetadadosSchema,
  }),
]);
export type ProjetoCreateInput = z.infer<typeof projetoCreateSchema>;
