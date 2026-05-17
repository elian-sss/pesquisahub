import { z } from "zod";
import { objectIdString } from "./embeds";

// ============================================================
// Schemas Zod para metadados_programa por tipo de projeto.
// O documento Mongoose declara este campo como Schema.Types.Mixed,
// entao TODA validacao acontece aqui antes do save / update.
//
// O *uso* destes schemas e via discriminated union em projeto.ts:
//   z.discriminatedUnion("tipo", [
//     baseProjeto.extend({ tipo: z.literal("MONITORIA"), metadados_programa: monitoriaMetadados }),
//     ...
//   ])
// ============================================================

export const monitoriaMetadadosSchema = z.object({
  subtipo: z.enum(["DISCIPLINA", "LABORATORIO"]),
  modalidade: z.enum(["remunerada", "voluntaria"]),
  semestre_letivo: z
    .string()
    .regex(/^\d{4}\.\d$/, "Formato esperado: AAAA.S (ex: 2025.2)"),
  carga_horaria_semanal: z.number().int().positive(),
  disciplina: z
    .object({
      codigo: z.string().min(1),
      nome: z.string().min(1),
      turma: z.string().min(1),
      num_alunos_atendidos: z.number().int().nonnegative().optional(),
    })
    .optional(),
  laboratorio: z
    .object({
      nome: z.string().min(1),
      sigla: z.string().optional(),
      responsavel_tecnico: z.string().optional(),
    })
    .optional(),
  atividades_previstas: z.array(z.string()).default([]),
});
export type MonitoriaMetadadosInput = z.infer<typeof monitoriaMetadadosSchema>;

export const petMetadadosSchema = z.object({
  grupo: z.string().min(1),
  area_tematica: z.string().min(1),
  ano_criacao: z.number().int().min(1900).max(2100),
  tutor_atual_id: objectIdString,
  num_bolsistas_atual: z.number().int().nonnegative(),
  atividades: z.object({
    ensino: z.array(z.string()).default([]),
    pesquisa: z.array(z.string()).default([]),
    extensao: z.array(z.string()).default([]),
  }),
});
export type PetMetadadosInput = z.infer<typeof petMetadadosSchema>;

export const piapeMetadadosSchema = z.object({
  unidade_demandante: z.string().min(1),
  tipo_demanda: z.enum(["servico", "produto", "processo"]),
  problema_institucional: z.string().min(1),
  solucao_proposta: z.string().min(1),
  categoria_inovacao: z.string().min(1),
  coordenador_categoria: z.enum(["docente", "tecnico_administrativo"]),
  beneficiarios_estimados: z.number().int().nonnegative().optional(),
});
export type PiapeMetadadosInput = z.infer<typeof piapeMetadadosSchema>;

export const pibicMetadadosSchema = z.object({
  modalidade: z.enum(["PIBIC", "PIBITI", "PIBIC_EM"]),
  tem_bolsa: z.boolean(),
  area_cnpq_codigo: z.string().min(1),
  area_cnpq_nome: z.string().min(1),
  agencia_pagadora: z.enum(["CNPq", "FAPESPA", "UFOPA"]),
  plano_trabalho: z.string().min(1),
  lattes_orientador_snapshot: z.string().optional(),
  lattes_bolsista_snapshot: z.string().optional(),
  produtos_esperados: z.object({
    publicacoes: z.number().int().nonnegative().default(0),
    apresentacao_seminario: z.boolean().default(false),
  }),
});
export type PibicMetadadosInput = z.infer<typeof pibicMetadadosSchema>;

export const embrapiiMetadadosSchema = z.object({
  empresa_parceira: z.object({
    razao_social: z.string().min(1),
    cnpj: z
      .string()
      .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/, "CNPJ invalido"),
    porte: z.enum(["micro", "pequena", "media", "grande"]),
  }),
  trl_inicial: z.number().int().min(1).max(9),
  trl_alvo: z.number().int().min(1).max(9),
  area_tecnologica: z.string().min(1),
  valor_total: z.number().nonnegative(),
  valor_contrapartida_empresa: z.number().nonnegative(),
  valor_embrapii: z.number().nonnegative(),
  valor_unidade: z.number().nonnegative(),
  marcos_contratuais: z
    .array(
      z.object({
        descricao: z.string().min(1),
        prazo: z.coerce.date(),
        concluido: z.boolean().default(false),
      }),
    )
    .default([]),
});
export type EmbrapiiMetadadosInput = z.infer<typeof embrapiiMetadadosSchema>;

// "OUTRO" e o catch-all: passthrough mantem chaves extras que o usuario adicionar.
export const outroMetadadosSchema = z
  .object({
    descricao_programa: z.string().min(1),
  })
  .passthrough();
export type OutroMetadadosInput = z.infer<typeof outroMetadadosSchema>;
