import { StatusBadge } from "@/components/shared/StatusBadge";
import type { ProjetoDetalhe } from "@/lib/queries/projetos";
import { EntregaToggle } from "./entrega-toggle";
import type { Role, StatusEntrega, StatusMeta } from "@/types";

const fmt = (d: Date) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function CronogramaTab({
  projeto,
  role,
}: {
  projeto: ProjetoDetalhe;
  role: Role;
}) {
  if (projeto.cronograma.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-12 text-center text-muted-foreground">
        Nenhuma meta cadastrada.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {projeto.cronograma.map((meta, idx) => {
        const total = meta.entregas.length;
        const concluidas = meta.entregas.filter((e) => e.status === "concluido").length;
        const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
        return (
          <div key={meta._id} className="bg-white border rounded-xl">
            <div className="px-5 py-4 border-b flex items-center gap-4">
              <span className="serif text-base font-semibold tracking-[-0.01em] tnum text-muted-foreground">
                M{idx + 1}
              </span>
              <div className="flex-1">
                <div className="serif text-base font-semibold tracking-[-0.01em]">
                  {meta.titulo}
                </div>
                <div className="text-xs text-muted-foreground">
                  Prazo: {fmt(meta.prazo)} · {concluidas}/{total} entregas
                </div>
              </div>
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className="flex-1 h-1.5 bg-line-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="tnum text-xs font-semibold w-8 text-right">
                  {pct}%
                </span>
              </div>
              <StatusBadge status={meta.status as StatusMeta} />
            </div>
            <div className="divide-y">
              {meta.entregas.length === 0 && (
                <div className="p-5 text-sm text-muted-foreground">
                  Sem entregas cadastradas nesta meta.
                </div>
              )}
              {meta.entregas.map((entrega) => (
                <div
                  key={entrega._id}
                  className="px-5 py-3 flex items-center gap-3"
                >
                  <EntregaToggle
                    projetoId={projeto._id}
                    metaId={meta._id}
                    entregaId={entrega._id}
                    status={entrega.status as StatusEntrega}
                    canEdit={role !== "ADMIN"}
                  />
                  <div className="flex-1 text-sm">{entrega.descricao}</div>
                  <StatusBadge status={entrega.status as StatusEntrega} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
