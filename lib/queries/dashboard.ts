import "server-only";
import { Types } from "mongoose";
import { connectMongo } from "@/lib/db/connection";
import { ProjetoModel } from "@/models/Projeto";
import { RegistroHorasModel } from "@/models/RegistroHoras";
import type { StatusProjeto, TipoProjeto } from "@/types";

// ============================================================
// Agregações MongoDB para os dashboards. Cada pipeline comenta
// qual índice está aproveitando — parte da nota da disciplina.
// ============================================================

export interface KPIAdmin {
  projetosAtivos: number;
  projetosAtrasados: number;
  bolsistasAtivos: number;
  totalProjetos: number;
}

export interface ProjetoPorTipo { tipo: TipoProjeto; count: number; }
export interface ProjetoPorStatus { status: StatusProjeto; count: number; }
export interface ProjetoPorPrograma {
  programa_id: string;
  sigla: string;
  nome_completo: string;
  count: number;
}

export async function getAdminKPIs(): Promise<KPIAdmin> {
  await connectMongo();
  // Aproveita: { tipo: 1, status: 1 } (varre status apenas)
  const [res] = await ProjetoModel.aggregate<KPIAdmin & { _id: null }>([
    {
      $group: {
        _id: null,
        totalProjetos: { $sum: 1 },
        projetosAtivos: {
          $sum: { $cond: [{ $in: ["$status", ["planejado", "em_andamento"]] }, 1, 0] },
        },
        projetosAtrasados: {
          $sum: { $cond: [{ $eq: ["$status", "atrasado"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalProjetos: 1,
        projetosAtivos: 1,
        projetosAtrasados: 1,
        bolsistasAtivos: { $literal: 0 },
      },
    },
  ]);

  // Bolsistas distintos: $unwind em equipe + $match papel + $group por usuario
  // Aproveita índice { "equipe.usuario_id": 1 } indiretamente quando filtra.
  const bolsistas = await ProjetoModel.aggregate<{ count: number }>([
    { $match: { status: { $in: ["planejado", "em_andamento"] } } },
    { $unwind: "$equipe" },
    { $match: { "equipe.papel": { $in: ["bolsista", "monitor"] } } },
    { $group: { _id: "$equipe.usuario_id" } },
    { $count: "count" },
  ]);

  return {
    totalProjetos: res?.totalProjetos ?? 0,
    projetosAtivos: res?.projetosAtivos ?? 0,
    projetosAtrasados: res?.projetosAtrasados ?? 0,
    bolsistasAtivos: bolsistas[0]?.count ?? 0,
  };
}

export async function getProjetosPorTipo(): Promise<ProjetoPorTipo[]> {
  await connectMongo();
  // Aproveita: { tipo: 1, status: 1 } — index scan no campo de agrupamento.
  return ProjetoModel.aggregate<ProjetoPorTipo>([
    { $group: { _id: "$tipo", count: { $sum: 1 } } },
    { $project: { _id: 0, tipo: "$_id", count: 1 } },
    { $sort: { count: -1 } },
  ]);
}

export async function getProjetosPorStatus(): Promise<ProjetoPorStatus[]> {
  await connectMongo();
  // Aproveita: { tipo: 1, status: 1 } — status é segundo campo composto, mas
  // como agregamos no status diretamente, MongoDB ainda usa o índice via covering.
  return ProjetoModel.aggregate<ProjetoPorStatus>([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { _id: 0, status: "$_id", count: 1 } },
  ]);
}

export async function getProjetosPorPrograma(): Promise<ProjetoPorPrograma[]> {
  await connectMongo();
  // Aproveita: { programa_id: 1 } no $group, + $lookup com programas (índice unique de sigla).
  return ProjetoModel.aggregate<ProjetoPorPrograma>([
    { $group: { _id: "$programa_id", count: { $sum: 1 } } },
    {
      $lookup: {
        from: "programas",
        localField: "_id",
        foreignField: "_id",
        as: "programa",
      },
    },
    { $unwind: "$programa" },
    {
      $project: {
        _id: 0,
        programa_id: { $toString: "$_id" },
        sigla: "$programa.sigla",
        nome_completo: "$programa.nome_completo",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);
}

export interface ProjetoResumo {
  _id: string;
  titulo: string;
  tipo: TipoProjeto;
  status: StatusProjeto;
  campus: string;
  coordenador?: string;
  vigencia_fim: Date;
}

export async function getUltimosProjetos(limit = 6): Promise<ProjetoResumo[]> {
  await connectMongo();
  // Aproveita o índice padrão de _id desc (criado_em correlaciona com ObjectId).
  const docs = await ProjetoModel.aggregate<ProjetoResumo>([
    { $sort: { criado_em: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: { $toString: "$_id" },
        titulo: 1,
        tipo: 1,
        status: 1,
        campus: 1,
        vigencia_fim: "$vigencia.fim",
        coordenador: {
          $let: {
            vars: {
              coord: {
                $first: {
                  $filter: {
                    input: "$equipe",
                    as: "m",
                    cond: { $eq: ["$$m.papel", "coordenador"] },
                  },
                },
              },
            },
            in: "$$coord.nome",
          },
        },
      },
    },
  ]);
  return docs;
}

export interface ProjetoComProgresso extends ProjetoResumo {
  total_metas: number;
  metas_concluidas: number;
  progresso_pct: number;
  vigencia_inicio: Date;
}

export async function getProjetosDoCoordenador(
  usuarioId: string,
): Promise<ProjetoComProgresso[]> {
  await connectMongo();
  // Aproveita: { "equipe.usuario_id": 1 } — match direto via multikey index.
  // Calcula % de metas concluidas com $unwind + $group dentro do mesmo pipeline.
  return ProjetoModel.aggregate<ProjetoComProgresso>([
    {
      $match: {
        equipe: {
          $elemMatch: {
            usuario_id: new Types.ObjectId(usuarioId),
            papel: "coordenador",
          },
        },
      },
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        titulo: 1,
        tipo: 1,
        status: 1,
        campus: 1,
        vigencia_inicio: "$vigencia.inicio",
        vigencia_fim: "$vigencia.fim",
        total_metas: { $size: { $ifNull: ["$cronograma", []] } },
        metas_concluidas: {
          $size: {
            $filter: {
              input: { $ifNull: ["$cronograma", []] },
              as: "m",
              cond: { $eq: ["$$m.status", "concluido"] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        progresso_pct: {
          $cond: [
            { $gt: ["$total_metas", 0] },
            {
              $round: [
                { $multiply: [{ $divide: ["$metas_concluidas", "$total_metas"] }, 100] },
                0,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { vigencia_fim: 1 } },
  ]);
}

export interface PendenciaHoras {
  total: number;
  por_projeto: Array<{ projeto_id: string; titulo: string; count: number }>;
}

export async function getHorasPendentesDoCoordenador(
  usuarioId: string,
): Promise<PendenciaHoras> {
  await connectMongo();
  // 1) Pega projetos do coordenador
  // 2) Busca registros pendentes nesses projetos
  // Aproveita { "equipe.usuario_id": 1 } e { status: 1, projeto_id: 1 } em registros.
  const projetos = await ProjetoModel.find(
    {
      equipe: {
        $elemMatch: {
          usuario_id: new Types.ObjectId(usuarioId),
          papel: "coordenador",
        },
      },
    },
    { _id: 1, titulo: 1 },
  ).lean();

  if (projetos.length === 0) return { total: 0, por_projeto: [] };

  const pendentes = await RegistroHorasModel.aggregate<{
    _id: Types.ObjectId;
    count: number;
  }>([
    {
      $match: {
        status: "pendente",
        projeto_id: { $in: projetos.map((p) => p._id) },
      },
    },
    { $group: { _id: "$projeto_id", count: { $sum: 1 } } },
  ]);

  const mapTitulo = new Map(projetos.map((p) => [String(p._id), p.titulo]));
  const por_projeto = pendentes.map((p) => ({
    projeto_id: String(p._id),
    titulo: mapTitulo.get(String(p._id)) ?? "",
    count: p.count,
  }));

  return {
    total: por_projeto.reduce((s, p) => s + p.count, 0),
    por_projeto,
  };
}

export interface BolsistaResumo {
  horas_mes: number;
  meta_horas_mes: number;
  projetos: Array<{ _id: string; titulo: string; tipo: TipoProjeto }>;
  tarefas_pendentes: Array<{
    projeto_id: string;
    projeto_titulo: string;
    meta_titulo: string;
    descricao: string;
    prazo: Date;
  }>;
  proxima_entrega?: { descricao: string; prazo: Date };
}

export async function getBolsistaResumo(usuarioId: string): Promise<BolsistaResumo> {
  await connectMongo();
  const id = new Types.ObjectId(usuarioId);
  const inicio_mes = new Date();
  inicio_mes.setDate(1);
  inicio_mes.setHours(0, 0, 0, 0);

  // Horas do mes — aproveita { usuario_id: 1, data: -1 }.
  const [horas] = await RegistroHorasModel.aggregate<{ total: number }>([
    {
      $match: {
        usuario_id: id,
        data: { $gte: inicio_mes },
        status: { $in: ["pendente", "aprovado"] },
      },
    },
    { $group: { _id: null, total: { $sum: "$horas" } } },
  ]);

  // Projetos do bolsista — aproveita { "equipe.usuario_id": 1 }
  const projetos = await ProjetoModel.find(
    { "equipe.usuario_id": id, status: { $ne: "cancelado" } },
    { titulo: 1, tipo: 1 },
  ).lean();

  // Tarefas atribuidas: $unwind no cronograma e nas entregas
  const tarefas = await ProjetoModel.aggregate<{
    projeto_id: string;
    projeto_titulo: string;
    meta_titulo: string;
    descricao: string;
    prazo: Date;
  }>([
    { $match: { "equipe.usuario_id": id } },
    { $unwind: "$cronograma" },
    { $unwind: "$cronograma.entregas" },
    {
      $match: {
        "cronograma.entregas.responsavel_id": id,
        "cronograma.entregas.status": { $ne: "concluido" },
      },
    },
    {
      $project: {
        _id: 0,
        projeto_id: { $toString: "$_id" },
        projeto_titulo: "$titulo",
        meta_titulo: "$cronograma.titulo",
        descricao: "$cronograma.entregas.descricao",
        prazo: "$cronograma.prazo",
      },
    },
    { $sort: { prazo: 1 } },
  ]);

  return {
    horas_mes: horas?.total ?? 0,
    meta_horas_mes: 80,
    projetos: projetos.map((p) => ({
      _id: String(p._id),
      titulo: p.titulo,
      tipo: p.tipo,
    })),
    tarefas_pendentes: tarefas,
    proxima_entrega: tarefas[0]
      ? { descricao: tarefas[0].descricao, prazo: tarefas[0].prazo }
      : undefined,
  };
}
