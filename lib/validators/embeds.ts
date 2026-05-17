import { Types } from "mongoose";
import { z } from "zod";

// Helper: aceita ObjectId, string hex valida ou string vazia/undefined opcional.
export const objectIdString = z
  .string()
  .refine((s) => Types.ObjectId.isValid(s), { message: "ObjectId invalido" });

export const contatoSchema = z.object({
  telefone: z.string().optional(),
  telefone_emergencia: z.string().optional(),
});

export const enderecoSchema = z.object({
  logradouro: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
});

export const dadosBancariosSchema = z.object({
  banco: z.string().optional(),
  agencia: z.string().optional(),
  conta: z.string().optional(),
  tipo: z.enum(["corrente", "poupanca"]).optional(),
});

export const academicoSchema = z.object({
  lattes: z.string().url().optional().or(z.literal("")),
  orcid: z.string().optional(),
  semestre_ingresso: z.string().optional(),
  previsao_conclusao: z.string().optional(),
});

export const preferenciasSchema = z.object({
  notificacoes_email: z.boolean().default(true),
  notificacoes_sistema: z.boolean().default(true),
  tema: z.enum(["claro", "escuro"]).default("claro"),
});

export const modalidadeBolsaSchema = z.object({
  nome: z.string().min(1),
  valor: z.number().nonnegative(),
  agencia_pagadora: z.string().optional(),
  duracao_meses: z.number().int().positive().optional(),
});

export const regulamentoSchema = z.object({
  url_documento: z.string().url().optional().or(z.literal("")),
  data_aprovacao: z.coerce.date().optional(),
  versao: z.string().optional(),
});

export const contatoResponsavelSchema = z.object({
  nome: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefone: z.string().optional(),
});

export const requisitosSchema = z.object({
  exige_lattes: z.boolean().default(false),
  exige_plano_trabalho: z.boolean().default(false),
  exige_relatorio_parcial: z.boolean().default(false),
  exige_relatorio_final: z.boolean().default(false),
  exige_apresentacao_seminario: z.boolean().default(false),
});
