import "server-only";
import { Types } from "mongoose";
import { connectMongo } from "@/lib/db/connection";
import { ProjetoModel } from "@/models/Projeto";
import { UsuarioModel } from "@/models/Usuario";
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

  // Horas agora vivem embedadas em usuarios.registros_horas[].
  // usuarioMatch reduz quais documentos entram no $unwind; registroMatch
  // filtra os subdocs ja desdobrados.
  const usuarioMatch: Record<string, unknown> = {};
  const registroMatch: Record<string, unknown> = {};
  if (filtros.status) registroMatch["registros_horas.status"] = filtros.status;

  if (user.role === "BOLSISTA") {
    // Le apenas o proprio documento (match por _id).
    usuarioMatch._id = new Types.ObjectId(user.usuario_id);
  } else if (user.role === "COORDENADOR") {
    // Coordenador ve horas dos projetos que coordena.
    // Aproveita { "equipe.usuario_id": 1 } em projetos.
    const projetos = await ProjetoModel.find(
      {
        equipe: {
          $elemMatch: {
            usuario_id: new Types.ObjectId(user.usuario_id),
            papel: "coordenador",
          },
        },
      },
      { _id: 1 },
    ).lean();
    const projetoIds = projetos.map((p) => p._id);
    if (projetoIds.length === 0) return [];
    // Aproveita { "registros_horas.projeto_id": 1 } para pre-filtrar usuarios.
    usuarioMatch["registros_horas.projeto_id"] = { $in: projetoIds };
    registroMatch["registros_horas.projeto_id"] = { $in: projetoIds };
  }
  // ADMIN: sem filtro de escopo — ve todas as horas.

  return UsuarioModel.aggregate<RegistroHorasItem>([
    { $match: usuarioMatch },
    { $unwind: "$registros_horas" },
    ...(Object.keys(registroMatch).length ? [{ $match: registroMatch }] : []),
    { $sort: { "registros_horas.data": -1 } },
    { $limit: 100 },
    {
      $lookup: {
        from: "projetos",
        localField: "registros_horas.projeto_id",
        foreignField: "_id",
        as: "projeto",
        pipeline: [{ $project: { titulo: 1, _id: 0 } }],
      },
    },
    { $unwind: { path: "$projeto", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        // _id e o do subdoc (registro) — usado na aprovacao.
        _id: { $toString: "$registros_horas._id" },
        projeto_id: { $toString: "$registros_horas.projeto_id" },
        projeto_titulo: "$projeto.titulo",
        usuario_nome: "$nome",
        data: "$registros_horas.data",
        horas: "$registros_horas.horas",
        atividade: "$registros_horas.atividade",
        tipo: "$registros_horas.tipo",
        status: "$registros_horas.status",
      },
    },
  ]);
}
