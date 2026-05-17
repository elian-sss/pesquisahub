import type { Types } from "mongoose";

export const ROLES = ["ADMIN", "COORDENADOR", "BOLSISTA"] as const;
export type Role = (typeof ROLES)[number];

export const CATEGORIAS = [
  "docente",
  "tecnico_administrativo",
  "discente_graduacao",
  "discente_pos",
  "externo",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const TIPOS_PROJETO = [
  "MONITORIA",
  "PET",
  "PIAPE",
  "PIBIC",
  "PD_EMBRAPII",
  "OUTRO",
] as const;
export type TipoProjeto = (typeof TIPOS_PROJETO)[number];

export const STATUS_PROJETO = [
  "planejado",
  "em_andamento",
  "concluido",
  "atrasado",
  "cancelado",
] as const;
export type StatusProjeto = (typeof STATUS_PROJETO)[number];

export const PAPEIS_EQUIPE = [
  "coordenador",
  "monitor",
  "bolsista",
  "voluntario",
  "colaborador",
] as const;
export type PapelEquipe = (typeof PAPEIS_EQUIPE)[number];

export const STATUS_META = [
  "planejado",
  "em_andamento",
  "concluido",
  "atrasado",
] as const;
export type StatusMeta = (typeof STATUS_META)[number];

export const STATUS_ENTREGA = ["pendente", "em_andamento", "concluido"] as const;
export type StatusEntrega = (typeof STATUS_ENTREGA)[number];

export const STATUS_REGISTRO_HORAS = ["pendente", "aprovado", "rejeitado"] as const;
export type StatusRegistroHoras = (typeof STATUS_REGISTRO_HORAS)[number];

export const TIPOS_HORAS = [
  "desenvolvimento",
  "reuniao",
  "escrita",
  "pesquisa",
  "ensino",
  "extensao",
  "outros",
] as const;
export type TipoHoras = (typeof TIPOS_HORAS)[number];

export const TIPOS_VINCULO = ["bolsista", "voluntario"] as const;
export type TipoVinculo = (typeof TIPOS_VINCULO)[number];

export const NATUREZAS_PROGRAMA = ["interno", "externo"] as const;
export type NaturezaPrograma = (typeof NATUREZAS_PROGRAMA)[number];

export const TIPOS_UNIDADE_ACADEMICA = ["instituto", "campus", "nucleo"] as const;
export type TipoUnidadeAcademica = (typeof TIPOS_UNIDADE_ACADEMICA)[number];

// ============================================================
// metadados_programa — uniao discriminada por tipo de projeto.
// O campo e Schema.Types.Mixed no Mongoose; a validacao em runtime
// acontece via Zod (Fase 3). Aqui esta apenas a forma TS para uso
// no UI e nas Server Actions.
// ============================================================

export interface MetadadosMonitoria {
  subtipo: "DISCIPLINA" | "LABORATORIO";
  modalidade: "remunerada" | "voluntaria";
  semestre_letivo: string;
  carga_horaria_semanal: number;
  disciplina?: {
    codigo: string;
    nome: string;
    turma: string;
    num_alunos_atendidos?: number;
  };
  laboratorio?: {
    nome: string;
    sigla?: string;
    responsavel_tecnico?: string;
  };
  atividades_previstas: string[];
}

export interface MetadadosPET {
  grupo: string;
  area_tematica: string;
  ano_criacao: number;
  tutor_atual_id: Types.ObjectId;
  num_bolsistas_atual: number;
  atividades: {
    ensino: string[];
    pesquisa: string[];
    extensao: string[];
  };
}

export interface MetadadosPIAPE {
  unidade_demandante: string;
  tipo_demanda: "servico" | "produto" | "processo";
  problema_institucional: string;
  solucao_proposta: string;
  categoria_inovacao: string;
  coordenador_categoria: "docente" | "tecnico_administrativo";
  beneficiarios_estimados?: number;
}

export interface MetadadosPIBIC {
  modalidade: "PIBIC" | "PIBITI" | "PIBIC_EM";
  tem_bolsa: boolean;
  area_cnpq_codigo: string;
  area_cnpq_nome: string;
  agencia_pagadora: "CNPq" | "FAPESPA" | "UFOPA";
  plano_trabalho: string;
  lattes_orientador_snapshot?: string;
  lattes_bolsista_snapshot?: string;
  produtos_esperados: {
    publicacoes: number;
    apresentacao_seminario: boolean;
  };
}

export interface MetadadosEmbrapii {
  empresa_parceira: {
    razao_social: string;
    cnpj: string;
    porte: "micro" | "pequena" | "media" | "grande";
  };
  trl_inicial: number;
  trl_alvo: number;
  area_tecnologica: string;
  valor_total: number;
  valor_contrapartida_empresa: number;
  valor_embrapii: number;
  valor_unidade: number;
  marcos_contratuais: Array<{
    descricao: string;
    prazo: Date;
    concluido: boolean;
  }>;
}

export interface MetadadosOutro {
  descricao_programa: string;
  [extra: string]: unknown;
}

export type MetadadosPrograma =
  | MetadadosMonitoria
  | MetadadosPET
  | MetadadosPIAPE
  | MetadadosPIBIC
  | MetadadosEmbrapii
  | MetadadosOutro;
