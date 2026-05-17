import Link from "next/link";
import { ArrowRight, Calendar, Clock, Flag, Star } from "lucide-react";
import { KPI } from "@/components/shared/KPI";
import { getBolsistaResumo } from "@/lib/queries/dashboard";

export async function DashboardBolsista({ usuarioId }: { usuarioId: string }) {
  const r = await getBolsistaResumo(usuarioId);
  const pct = Math.round((r.horas_mes / r.meta_horas_mes) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label="Horas no mês"
          value={`${r.horas_mes}h`}
          Icon={Clock}
          foot={`meta: ${r.meta_horas_mes}h · ${pct}%`}
          footKind={pct >= 80 ? "up" : undefined}
        />
        <KPI
          label="Tarefas pendentes"
          value={r.tarefas_pendentes.length}
          Icon={Flag}
          foot={`em ${r.projetos.length} projeto${r.projetos.length === 1 ? "" : "s"}`}
        />
        <KPI
          label="Próxima entrega"
          value={
            r.proxima_entrega
              ? new Date(r.proxima_entrega.prazo).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })
              : "—"
          }
          Icon={Calendar}
          foot={r.proxima_entrega?.descricao.slice(0, 30)}
        />
        <KPI
          label="Projetos ativos"
          value={r.projetos.length}
          Icon={Star}
          accent="var(--primary)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        <div
          className="rounded-xl p-6 text-white"
          style={{
            background:
              "linear-gradient(135deg, #0F4C5C 0%, #1A6878 100%)",
          }}
        >
          <div className="text-xs uppercase tracking-[0.08em] opacity-70 font-medium">
            Minhas tarefas
          </div>
          <div className="serif text-[40px] font-medium tnum mt-2">
            {r.tarefas_pendentes.length}
          </div>
          <div className="text-sm opacity-85 mt-1">
            entregas pendentes para você
          </div>
          {r.proxima_entrega && (
            <div className="mt-6 pt-6 border-t border-white/15">
              <div className="text-xs opacity-70 uppercase tracking-wide mb-1">
                Mais próxima
              </div>
              <div className="font-medium">{r.proxima_entrega.descricao}</div>
              <div className="text-sm opacity-75 mt-1">
                até{" "}
                {new Date(r.proxima_entrega.prazo).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                })}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="serif text-base font-semibold tracking-[-0.01em]">
              Tarefas a fazer
            </div>
            <Link
              href="/horas"
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              Registrar horas <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y">
            {r.tarefas_pendentes.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Sem tarefas pendentes. 🎉
              </div>
            )}
            {r.tarefas_pendentes.slice(0, 6).map((t, i) => (
              <Link
                key={i}
                href={`/projetos/${t.projeto_id}`}
                className="flex items-start gap-3 p-4 hover:bg-line-2"
              >
                <span className="w-8 h-8 rounded-lg grid place-items-center bg-primary-tint text-primary flex-shrink-0 mt-0.5">
                  <Flag size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground truncate">
                    {t.projeto_titulo} · {t.meta_titulo}
                  </div>
                  <div className="font-medium text-sm">{t.descricao}</div>
                </div>
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(t.prazo).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
