import { Types } from "mongoose";
import { connectMongo } from "@/lib/db/connection";
import { UsuarioModel } from "@/models/Usuario";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { StatusRegistroHoras, TipoHoras } from "@/types";

const fmt = (d: Date) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

interface RegistroDoProjeto {
  _id: string;
  pessoa: string;
  data: Date;
  atividade: string;
  tipo: TipoHoras;
  horas: number;
  status: StatusRegistroHoras;
}

export async function HorasTab({ projetoId }: { projetoId: string }) {
  if (!Types.ObjectId.isValid(projetoId)) return null;
  await connectMongo();
  const projetoOid = new Types.ObjectId(projetoId);
  // Horas embedadas em usuarios: varre quem tem registro deste projeto e
  // desdobra os apontamentos. Aproveita { "registros_horas.projeto_id": 1 }
  // no $match inicial; o nome da pessoa vem do documento pai (sem lookup).
  const registros = await UsuarioModel.aggregate<RegistroDoProjeto>([
    { $match: { "registros_horas.projeto_id": projetoOid } },
    { $unwind: "$registros_horas" },
    { $match: { "registros_horas.projeto_id": projetoOid } },
    { $sort: { "registros_horas.data": -1 } },
    { $limit: 50 },
    {
      $project: {
        _id: { $toString: "$registros_horas._id" },
        pessoa: "$nome",
        data: "$registros_horas.data",
        atividade: "$registros_horas.atividade",
        tipo: "$registros_horas.tipo",
        horas: "$registros_horas.horas",
        status: "$registros_horas.status",
      },
    },
  ]);

  const total = registros.reduce((s, r) => s + r.horas, 0);

  return (
    <div className="bg-white border rounded-xl">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div>
          <div className="serif text-base font-semibold tracking-[-0.01em]">
            Horas registradas no projeto
          </div>
          <div className="text-xs text-muted-foreground">
            Total: <span className="tnum font-semibold">{total}h</span> em{" "}
            {registros.length} registros
          </div>
        </div>
      </div>
      <div className="overflow-auto">
        {registros.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nenhum registro de horas neste projeto.
          </div>
        ) : (
          <table className="w-full text-[13.5px]">
            <thead className="bg-[#FBFAF6]">
              <tr className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                <th className="text-left font-medium px-4 py-3">Data</th>
                <th className="text-left font-medium px-4 py-3">Pessoa</th>
                <th className="text-left font-medium px-4 py-3">Atividade</th>
                <th className="text-left font-medium px-4 py-3">Tipo</th>
                <th className="text-right font-medium px-4 py-3">Horas</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r._id} className="border-t border-line-2">
                  <td className="px-4 py-3 text-xs">{fmt(r.data)}</td>
                  <td className="px-4 py-3 text-xs">{r.pessoa}</td>
                  <td className="px-4 py-3">{r.atividade}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
                    {r.tipo}
                  </td>
                  <td className="px-4 py-3 tnum font-semibold text-right">
                    {r.horas}h
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status === "aprovado" ? "concluido" : r.status === "rejeitado" ? "cancelado" : "pendente"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
