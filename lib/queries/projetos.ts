import "server-only";
import { Types } from "mongoose";
import { connectMongo } from "@/lib/db/connection";
import { ProjetoModel } from "@/models/Projeto";
import type { StatusProjeto, TipoProjeto, Role } from "@/types";

export interface FiltrosProjetos {
  tipo?: TipoProjeto;
  status?: StatusProjeto;
  programa_id?: string;
  q?: string;
}

export interface ProjetoListItem {
  _id: string;
  titulo: string;
  tipo: TipoProjeto;
  status: StatusProjeto;
  campus: string;
  programa?: { sigla: string; nome_completo: string };
  unidade?: { sigla: string; nome: string };
  coordenador?: string;
  equipe_count: number;
  vigencia_inicio: Date;
  vigencia_fim: Date;
  total_metas: number;
  metas_concluidas: number;
  progresso_pct: number;
}

export async function listarProjetos(
  filtros: FiltrosProjetos,
  user: { usuario_id: string; role: Role },
): Promise<ProjetoListItem[]> {
  await connectMongo();

  const match: Record<string, unknown> = {};
  if (filtros.tipo) match.tipo = filtros.tipo;
  if (filtros.status) match.status = filtros.status;
  if (filtros.programa_id && Types.ObjectId.isValid(filtros.programa_id)) {
    match.programa_id = new Types.ObjectId(filtros.programa_id);
  }
  if (filtros.q) {
    match.titulo = { $regex: filtros.q, $options: "i" };
  }

  // Role-gating: BOLSISTA e COORDENADOR so veem seus projetos.
  // Aproveita { "equipe.usuario_id": 1 } (multikey).
  if (user.role !== "ADMIN") {
    match["equipe.usuario_id"] = new Types.ObjectId(user.usuario_id);
  }

  return ProjetoModel.aggregate<ProjetoListItem>([
    { $match: match },
    { $sort: { criado_em: -1 } },
    {
      $lookup: {
        from: "programas",
        localField: "programa_id",
        foreignField: "_id",
        as: "programa",
        pipeline: [{ $project: { sigla: 1, nome_completo: 1, _id: 0 } }],
      },
    },
    { $unwind: { path: "$programa", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "unidades_academicas",
        localField: "unidade_academica_id",
        foreignField: "_id",
        as: "unidade",
        pipeline: [{ $project: { sigla: 1, nome: 1, _id: 0 } }],
      },
    },
    { $unwind: { path: "$unidade", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: { $toString: "$_id" },
        titulo: 1,
        tipo: 1,
        status: 1,
        campus: 1,
        programa: 1,
        unidade: 1,
        equipe_count: { $size: { $ifNull: ["$equipe", []] } },
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
        coordenador: {
          $let: {
            vars: {
              c: {
                $first: {
                  $filter: {
                    input: "$equipe",
                    as: "m",
                    cond: { $eq: ["$$m.papel", "coordenador"] },
                  },
                },
              },
            },
            in: "$$c.nome",
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
  ]);
}

export interface ProjetoDetalhe {
  _id: string;
  titulo: string;
  descricao: string;
  tipo: TipoProjeto;
  status: StatusProjeto;
  sigaa_id?: string;
  campus: string;
  programa: { _id: string; sigla: string; nome_completo: string; tipo: TipoProjeto } | null;
  unidade: { _id: string; sigla: string; nome: string; campus: string } | null;
  vigencia: {
    inicio: Date;
    fim: Date;
    prorrogacoes: Array<{ nova_data_fim: Date; motivo: string; registrado_em: Date }>;
  };
  equipe: Array<{
    usuario_id: string;
    nome: string;
    papel: string;
    categoria: string;
    tipo_vinculo?: string;
    valor_bolsa?: number;
    carga_horaria_semanal?: number;
    periodo: { inicio: Date; fim?: Date };
  }>;
  cronograma: Array<{
    _id: string;
    titulo: string;
    prazo: Date;
    status: string;
    concluido_em?: Date;
    entregas: Array<{
      _id: string;
      descricao: string;
      status: string;
      responsavel_id?: string;
      arquivo_id?: string;
    }>;
  }>;
  metadados_programa: Record<string, unknown>;
  recursos: {
    repositorio_git?: string;
    drive?: string;
    outros: Array<{ nome: string; url: string; tipo: string }>;
  };
  criado_em: Date;
  atualizado_em: Date;
}

export async function getProjetoPorId(
  id: string,
  user: { usuario_id: string; role: Role },
): Promise<ProjetoDetalhe | null> {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectMongo();

  const match: Record<string, unknown> = { _id: new Types.ObjectId(id) };
  if (user.role !== "ADMIN") {
    match["equipe.usuario_id"] = new Types.ObjectId(user.usuario_id);
  }

  const [doc] = await ProjetoModel.aggregate<ProjetoDetalhe>([
    { $match: match },
    {
      $lookup: {
        from: "programas",
        localField: "programa_id",
        foreignField: "_id",
        as: "programa",
        pipeline: [
          {
            $project: {
              _id: { $toString: "$_id" },
              sigla: 1,
              nome_completo: 1,
              tipo: 1,
            },
          },
        ],
      },
    },
    { $unwind: { path: "$programa", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "unidades_academicas",
        localField: "unidade_academica_id",
        foreignField: "_id",
        as: "unidade",
        pipeline: [
          {
            $project: {
              _id: { $toString: "$_id" },
              sigla: 1,
              nome: 1,
              campus: 1,
            },
          },
        ],
      },
    },
    { $unwind: { path: "$unidade", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        _id: { $toString: "$_id" },
        equipe: {
          $map: {
            input: "$equipe",
            as: "m",
            in: {
              $mergeObjects: ["$$m", { usuario_id: { $toString: "$$m.usuario_id" } }],
            },
          },
        },
        cronograma: {
          $map: {
            input: { $ifNull: ["$cronograma", []] },
            as: "meta",
            in: {
              $mergeObjects: [
                "$$meta",
                {
                  _id: { $toString: "$$meta._id" },
                  entregas: {
                    $map: {
                      input: { $ifNull: ["$$meta.entregas", []] },
                      as: "e",
                      in: {
                        $mergeObjects: [
                          "$$e",
                          {
                            _id: { $toString: "$$e._id" },
                            responsavel_id: { $toString: "$$e.responsavel_id" },
                            arquivo_id: { $toString: "$$e.arquivo_id" },
                          },
                        ],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  ]);

  return doc ?? null;
}
