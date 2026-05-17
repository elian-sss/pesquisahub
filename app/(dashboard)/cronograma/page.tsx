import Link from "next/link";
import { Calendar } from "lucide-react";
import { Types } from "mongoose";
import { requireAuth } from "@/lib/auth/session";
import { connectMongo } from "@/lib/db/connection";
import { ProjetoModel } from "@/models/Projeto";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusMeta, StatusEntrega } from "@/types";

interface MetaGlobal {
  projeto_id: string;
  projeto_titulo: string;
  meta_id: string;
  meta_titulo: string;
  prazo: Date;
  status: StatusMeta;
  total_entregas: number;
  entregas_concluidas: number;
}

const fmt = (d: Date) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default async function CronogramaPage() {
  const user = await requireAuth();
  await connectMongo();

  // Agregacao: $unwind no cronograma para virar uma lista plana de metas
  // ordenada por prazo. Aproveita { "equipe.usuario_id": 1 } no $match.
  const match: Record<string, unknown> = {};
  if (user.role !== "ADMIN") {
    match["equipe.usuario_id"] = new Types.ObjectId(user.usuario_id);
  }

  const metas: MetaGlobal[] = await ProjetoModel.aggregate([
    { $match: match },
    { $unwind: "$cronograma" },
    {
      $project: {
        _id: 0,
        projeto_id: { $toString: "$_id" },
        projeto_titulo: "$titulo",
        meta_id: { $toString: "$cronograma._id" },
        meta_titulo: "$cronograma.titulo",
        prazo: "$cronograma.prazo",
        status: "$cronograma.status",
        total_entregas: { $size: { $ifNull: ["$cronograma.entregas", []] } },
        entregas_concluidas: {
          $size: {
            $filter: {
              input: { $ifNull: ["$cronograma.entregas", []] },
              as: "e",
              cond: { $eq: ["$$e.status", "concluido"] },
            },
          },
        },
      },
    },
    { $sort: { prazo: 1 } },
  ]);

  // Agrupar por mes para visualizacao
  const grupos = new Map<string, MetaGlobal[]>();
  for (const m of metas) {
    const data = new Date(m.prazo);
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(m);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border rounded-xl p-5">
        <div className="serif text-lg font-medium tracking-[-0.015em] mb-1">
          Cronograma global
        </div>
        <div className="text-sm text-muted-foreground">
          {metas.length} meta{metas.length === 1 ? "" : "s"} agrupada{metas.length === 1 ? "" : "s"} por mês
        </div>
      </div>

      {grupos.size === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-muted-foreground">
          <Calendar size={24} className="mx-auto mb-2 opacity-40" />
          Nenhuma meta cadastrada.
        </div>
      ) : (
        Array.from(grupos.entries()).map(([mes, items]) => {
          const data = new Date(`${mes}-01T00:00:00`);
          return (
            <div key={mes} className="bg-white border rounded-xl">
              <div className="px-5 py-3 border-b bg-[#FBFAF6]">
                <div className="text-xs uppercase tracking-[0.06em] text-muted-foreground font-semibold">
                  {data.toLocaleDateString("pt-BR", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
              <div className="divide-y">
                {items.map((m) => (
                  <Link
                    key={m.meta_id}
                    href={`/projetos/${m.projeto_id}?tab=cronograma`}
                    className="px-5 py-4 flex items-center gap-4 hover:bg-line-2"
                  >
                    <div className="text-center min-w-[60px]">
                      <div className="serif text-xl font-medium tnum">
                        {new Date(m.prazo).getDate()}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                        {new Date(m.prazo).toLocaleDateString("pt-BR", { weekday: "short" })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{m.meta_titulo}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {m.projeto_titulo} · {m.entregas_concluidas}/{m.total_entregas} entregas
                      </div>
                    </div>
                    <StatusBadge status={m.status as StatusEntrega} />
                  </Link>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
