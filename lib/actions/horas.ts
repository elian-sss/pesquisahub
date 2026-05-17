"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectMongo } from "@/lib/db/connection";
import { requireAuth } from "@/lib/auth/session";
import {
  registroHorasAprovacaoSchema,
  registroHorasCreateSchema,
} from "@/lib/validators/registro-horas";
import { ProjetoModel } from "@/models/Projeto";
import { RegistroHorasModel } from "@/models/RegistroHoras";
import type { ActionResult } from "./projetos";

export async function registrarHoras(
  payload: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAuth();
  const parsed = registroHorasCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues.map((i) => i.message).join("; "),
    };
  }

  await connectMongo();
  const created = await RegistroHorasModel.create({
    ...parsed.data,
    projeto_id: new Types.ObjectId(parsed.data.projeto_id),
    meta_id: parsed.data.meta_id
      ? new Types.ObjectId(parsed.data.meta_id)
      : undefined,
    usuario_id: new Types.ObjectId(user.usuario_id),
    status: "pendente",
  });

  revalidatePath("/horas");
  revalidatePath("/dashboard");
  return { ok: true, data: { id: String(created._id) } };
}

export async function aprovarRejeitarHoras(
  payload: unknown,
): Promise<ActionResult> {
  const user = await requireAuth();
  if (user.role === "BOLSISTA") {
    return { ok: false, error: "Apenas coordenadores podem aprovar horas." };
  }

  const parsed = registroHorasAprovacaoSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "Payload inválido" };

  await connectMongo();
  const { registro_id, status, observacao } = parsed.data;

  const registro = await RegistroHorasModel.findById(registro_id).lean();
  if (!registro) return { ok: false, error: "Registro não encontrado." };

  // Coordenador so pode aprovar registros dos projetos que coordena.
  if (user.role === "COORDENADOR") {
    const projeto = await ProjetoModel.findOne(
      {
        _id: registro.projeto_id,
        equipe: {
          $elemMatch: {
            usuario_id: new Types.ObjectId(user.usuario_id),
            papel: "coordenador",
          },
        },
      },
      { _id: 1 },
    ).lean();
    if (!projeto) {
      return { ok: false, error: "Você não coordena este projeto." };
    }
  }

  await RegistroHorasModel.updateOne(
    { _id: new Types.ObjectId(registro_id) },
    {
      $set: {
        status,
        aprovacao: {
          aprovador_id: new Types.ObjectId(user.usuario_id),
          aprovado_em: new Date(),
          observacao,
        },
      },
    },
  );

  revalidatePath("/horas");
  revalidatePath("/dashboard");
  return { ok: true, data: null };
}
