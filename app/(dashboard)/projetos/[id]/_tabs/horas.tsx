import { Types } from "mongoose";
import { connectMongo } from "@/lib/db/connection";
import { RegistroHorasModel } from "@/models/RegistroHoras";
import { UsuarioModel } from "@/models/Usuario";
import { StatusBadge } from "@/components/shared/StatusBadge";

const fmt = (d: Date) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export async function HorasTab({ projetoId }: { projetoId: string }) {
  if (!Types.ObjectId.isValid(projetoId)) return null;
  await connectMongo();
  // Aproveita: { projeto_id: 1, data: -1 }
  const registros = await RegistroHorasModel.find({
    projeto_id: new Types.ObjectId(projetoId),
  })
    .sort({ data: -1 })
    .limit(50)
    .lean();
  const usuarios = await UsuarioModel.find(
    { _id: { $in: registros.map((r) => r.usuario_id) } },
    { nome: 1 },
  ).lean();
  const nomePorId = new Map(usuarios.map((u) => [String(u._id), u.nome]));

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
                <tr key={String(r._id)} className="border-t border-line-2">
                  <td className="px-4 py-3 text-xs">{fmt(r.data)}</td>
                  <td className="px-4 py-3 text-xs">
                    {nomePorId.get(String(r.usuario_id)) ?? "—"}
                  </td>
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
