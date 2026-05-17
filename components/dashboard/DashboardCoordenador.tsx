import Link from "next/link";
import { ArrowRight, Clock, FolderOpen, Plus, Target } from "lucide-react";
import { KPI } from "@/components/shared/KPI";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  getHorasPendentesDoCoordenador,
  getProjetosDoCoordenador,
} from "@/lib/queries/dashboard";

export async function DashboardCoordenador({
  usuarioId,
}: {
  usuarioId: string;
}) {
  const [projetos, pendencias] = await Promise.all([
    getProjetosDoCoordenador(usuarioId),
    getHorasPendentesDoCoordenador(usuarioId),
  ]);

  const ativos = projetos.filter(
    (p) => p.status === "planejado" || p.status === "em_andamento",
  ).length;
  const proximos = projetos.filter((p) => {
    const diff = new Date(p.vigencia_fim).getTime() - Date.now();
    return diff > 0 && diff < 1000 * 60 * 60 * 24 * 60;
  }).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Meus projetos ativos" value={ativos} Icon={FolderOpen} foot={`${projetos.length} no total`} />
        <KPI
          label="Horas pendentes"
          value={pendencias.total}
          Icon={Clock}
          foot={pendencias.total > 0 ? "aprovação necessária" : "tudo em dia"}
          footKind={pendencias.total > 0 ? "down" : "up"}
        />
        <KPI label="Vigência próxima" value={proximos} Icon={Target} foot="nos próximos 60 dias" />
        <KPI
          label="Metas no total"
          value={projetos.reduce((s, p) => s + p.total_metas, 0)}
          Icon={Target}
          accent="var(--primary)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <div className="bg-white border rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="serif text-base font-semibold tracking-[-0.01em]">
              Meus projetos
            </div>
            <Link
              href="/projetos/novo"
              className="inline-flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-[color:var(--primary-deep)]"
            >
              <Plus size={13} /> Novo projeto
            </Link>
          </div>
          <div className="p-2 flex flex-col gap-2">
            {projetos.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Você ainda não coordena nenhum projeto.
              </div>
            )}
            {projetos.map((p) => (
              <Link
                key={p._id}
                href={`/projetos/${p._id}`}
                className="block p-4 rounded-lg border border-transparent hover:border-line transition"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-primary-tint text-primary text-[11px] font-semibold">
                      {p.tipo}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  <span className="tnum text-xs font-semibold">
                    {p.progresso_pct}%
                  </span>
                </div>
                <div className="font-medium text-sm mb-2">{p.titulo}</div>
                <div className="h-1.5 bg-line-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${p.progresso_pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2.5 text-xs text-muted-foreground">
                  <span>
                    {p.metas_concluidas}/{p.total_metas} metas concluídas
                  </span>
                  <span>
                    Vigência até{" "}
                    {new Date(p.vigencia_fim).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="serif text-base font-semibold tracking-[-0.01em]">
              Pendências
            </div>
          </div>
          <div className="p-3 flex flex-col gap-1">
            <Link
              href="/horas"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-line-2"
            >
              <span className="w-8 h-8 rounded-lg grid place-items-center bg-[color:var(--warn-tint)] text-[#B45309]">
                <Clock size={15} />
              </span>
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {pendencias.total} registro{pendencias.total === 1 ? "" : "s"} de horas
                </div>
                <div className="text-xs text-muted-foreground">
                  aguardando sua aprovação
                </div>
              </div>
              <ArrowRight size={14} className="text-muted-foreground" />
            </Link>
            {pendencias.por_projeto.slice(0, 3).map((p) => (
              <Link
                key={p.projeto_id}
                href={`/projetos/${p.projeto_id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-line-2"
              >
                <span className="w-8 h-8 rounded-lg grid place-items-center bg-primary-tint text-primary">
                  <FolderOpen size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.titulo}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.count} registro{p.count === 1 ? "" : "s"} pendente{p.count === 1 ? "" : "s"}
                  </div>
                </div>
                <ArrowRight size={14} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
