"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { z } from "zod";
import { connectMongo } from "@/lib/db/connection";
import { requireAuth } from "@/lib/auth/session";
import { projetoCreateSchema } from "@/lib/validators/projeto";
import { ProjetoModel } from "@/models/Projeto";
import { UsuarioModel } from "@/models/Usuario";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function criarProjeto(
  payload: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth();
  if (user.role === "BOLSISTA") {
    return { ok: false, error: "Bolsistas não podem criar projetos." };
  }

  const parsed = projetoCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    };
  }

  await connectMongo();

  // Snapshot do nome dos membros para desnormalizacao
  const usuarioIds = parsed.data.equipe.map(
    (m) => new Types.ObjectId(m.usuario_id),
  );
  const usuariosDb = await UsuarioModel.find(
    { _id: { $in: usuarioIds } },
    { nome: 1 },
  ).lean();
  const nomePorId = new Map(usuariosDb.map((u) => [String(u._id), u.nome]));

  const equipeComNome = parsed.data.equipe.map((m) => ({
    ...m,
    usuario_id: new Types.ObjectId(m.usuario_id),
    nome: nomePorId.get(m.usuario_id) ?? m.nome,
  }));

  const created = await ProjetoModel.create({
    ...parsed.data,
    programa_id: new Types.ObjectId(parsed.data.programa_id),
    unidade_academica_id: new Types.ObjectId(parsed.data.unidade_academica_id),
    equipe: equipeComNome,
  });

  revalidatePath("/projetos");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: String(created._id) } };
}

const toggleEntregaSchema = z.object({
  projeto_id: z.string(),
  meta_id: z.string(),
  entrega_id: z.string(),
  status: z.enum(["pendente", "em_andamento", "concluido"]),
});

export async function atualizarStatusEntrega(
  payload: unknown,
): Promise<ActionResult> {
  await requireAuth();
  const parsed = toggleEntregaSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "Payload inválido" };

  await connectMongo();
  const { projeto_id, meta_id, entrega_id, status } = parsed.data;

  await ProjetoModel.updateOne(
    {
      _id: new Types.ObjectId(projeto_id),
      "cronograma._id": new Types.ObjectId(meta_id),
      "cronograma.entregas._id": new Types.ObjectId(entrega_id),
    },
    {
      $set: { "cronograma.$[m].entregas.$[e].status": status },
    },
    {
      arrayFilters: [
        { "m._id": new Types.ObjectId(meta_id) },
        { "e._id": new Types.ObjectId(entrega_id) },
      ],
    },
  );

  revalidatePath(`/projetos/${projeto_id}`);
  return { ok: true, data: null };
}
