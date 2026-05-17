import "server-only";
import { Types } from "mongoose";
import { connectMongo } from "@/lib/db/connection";
import { RegistroHorasModel } from "@/models/RegistroHoras";
import type { Role, StatusRegistroHoras, TipoHoras } from "@/types";

export interface RegistroHorasItem {
  _id: string;
  projeto_id: string;
  projeto_titulo: string;
  usuario_nome: string;
  data: Date;
  horas: number;
  atividade: string;
  tipo: TipoHoras;
  status: StatusRegistroHoras;
}

export async function listarHoras(
  user: { usuario_id: string; role: Role },
  filtros: { status?: StatusRegistroHoras } = {},
): Promise<RegistroHorasItem[]> {
  await connectMongo();
  const match: Record<string, unknown> = {};
  if (filtros.status) match.status = filtros.status;

  if (user.role === "BOLSISTA") {
    // Aproveita { usuario_id: 1, data: -1 }
    match.usuario_id = new Types.ObjectId(user.usuario_id);
  } else if (user.role === "COORDENADOR") {
    // Coordenador ve horas dos projetos que coordena (resolvido em pipeline)
  }

  return RegistroHorasModel.aggregate<RegistroHorasItem>([
    { $match: match },
    { $sort: { data: -1 } },
    { $limit: 100 },
    {
      $lookup: {
        from: "projetos",
        localField: "projeto_id",
        foreignField: "_id",
        as: "projeto",
        pipeline: [
          {
            $project: {
              titulo: 1,
              equipe: 1,
              _id: 0,
            },
          },
        ],
      },
    },
    { $unwind: { path: "$projeto", preserveNullAndEmptyArrays: true } },
    ...(user.role === "COORDENADOR"
      ? [
          {
            $match: {
              "projeto.equipe": {
                $elemMatch: {
                  usuario_id: new Types.ObjectId(user.usuario_id),
                  papel: "coordenador",
                },
              },
            },
          },
        ]
      : []),
    {
      $lookup: {
        from: "usuarios",
        localField: "usuario_id",
        foreignField: "_id",
        as: "usuario",
        pipeline: [{ $project: { nome: 1, _id: 0 } }],
      },
    },
    { $unwind: { path: "$usuario", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: { $toString: "$_id" },
        projeto_id: { $toString: "$projeto_id" },
        projeto_titulo: "$projeto.titulo",
        usuario_nome: "$usuario.nome",
        data: 1,
        horas: 1,
        atividade: 1,
        tipo: 1,
        status: 1,
      },
    },
  ]);
}
