"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { aprovarRejeitarHoras } from "@/lib/actions/horas";
import type { RegistroHorasItem } from "@/lib/queries/horas";

const fmt = (d: Date) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function HorasList({
  registros,
  canApprove,
}: {
  registros: RegistroHorasItem[];
  canApprove: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const aprovar = (id: string, status: "aprovado" | "rejeitado") => {
    startTransition(async () => {
      const res = await aprovarRejeitarHoras({ registro_id: id, status });
      if (!res.ok) toast.error(res.error);
      else {
        toast.success(status === "aprovado" ? "Registro aprovado" : "Registro rejeitado");
        router.refresh();
      }
    });
  };

  const totais = registros.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + r.horas;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="bg-white border rounded-xl">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div>
          <div className="serif text-base font-semibold tracking-[-0.01em]">
            Registros
          </div>
          <div className="text-xs text-muted-foreground tnum">
            Aprovado: {totais.aprovado ?? 0}h · Pendente: {totais.pendente ?? 0}h · Rejeitado: {totais.rejeitado ?? 0}h
          </div>
        </div>
      </div>
      <div className="overflow-auto">
        {registros.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Nenhum registro ainda.
          </div>
        ) : (
          <table className="w-full text-[13.5px]">
            <thead className="bg-[#FBFAF6]">
              <tr className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                <th className="text-left font-medium px-4 py-3">Data</th>
                <th className="text-left font-medium px-4 py-3">Projeto</th>
                <th className="text-left font-medium px-4 py-3">Pessoa</th>
                <th className="text-left font-medium px-4 py-3">Atividade</th>
                <th className="text-right font-medium px-4 py-3">Horas</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                {canApprove && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r._id} className="border-t border-line-2">
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {fmt(r.data)}
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[200px] truncate">
                    {r.projeto_titulo}
                  </td>
                  <td className="px-4 py-3 text-xs">{r.usuario_nome}</td>
                  <td className="px-4 py-3 max-w-[260px]">
                    <div className="truncate">{r.atividade}</div>
                    <div className="text-[11px] text-muted-foreground capitalize">
                      {r.tipo}
                    </div>
                  </td>
                  <td className="px-4 py-3 tnum font-semibold text-right">
                    {r.horas}h
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "px-2 py-0.5 rounded-full text-[11px] font-medium " +
                        (r.status === "aprovado"
                          ? "bg-[color:var(--ok-tint)] text-[#047857]"
                          : r.status === "rejeitado"
                            ? "bg-[color:var(--bad-tint)] text-[#B91C1C]"
                            : "bg-[color:var(--warn-tint)] text-[#B45309]")
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  {canApprove && (
                    <td className="px-4 py-3 text-right">
                      {r.status === "pendente" && (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => aprovar(r._id, "aprovado")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-[color:var(--ok-tint)] text-[#047857] hover:bg-[#bff0d6]"
                          >
                            <Check size={12} /> Aprovar
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => aprovar(r._id, "rejeitado")}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs bg-[color:var(--bad-tint)] text-[#B91C1C] hover:bg-[#fcc8c8]"
                          >
                            <X size={12} /> Rejeitar
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
