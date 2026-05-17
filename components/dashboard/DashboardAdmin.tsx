import Link from "next/link";
import { AlertTriangle, ArrowRight, ChartLine, FolderOpen, Users } from "lucide-react";
import { KPI } from "@/components/shared/KPI";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Avatar } from "@/components/shared/Avatar";
import { BarChartCard, PieChartCard } from "./Charts";
import {
  getAdminKPIs,
  getProjetosPorPrograma,
  getProjetosPorTipo,
  getUltimosProjetos,
} from "@/lib/queries/dashboard";

export async function DashboardAdmin() {
  const [kpis, porTipo, porPrograma, ultimos] = await Promise.all([
    getAdminKPIs(),
    getProjetosPorTipo(),
    getProjetosPorPrograma(),
    getUltimosProjetos(8),
  ]);

  const tipoChart = porTipo.map((p) => ({ name: p.tipo, value: p.count }));
  const programaChart = porPrograma.map((p) => ({ label: p.sigla, count: p.count }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Projetos ativos" value={kpis.projetosAtivos} Icon={FolderOpen} foot={`${kpis.totalProjetos} no total`} />
        <KPI label="Bolsistas ativos" value={kpis.bolsistasAtivos} Icon={Users} />
        <KPI label="Projetos atrasados" value={kpis.projetosAtrasados} Icon={AlertTriangle} footKind={kpis.projetosAtrasados > 0 ? "down" : undefined} foot={kpis.projetosAtrasados > 0 ? "requer atenção" : "tudo em dia"} />
        <KPI label="Cadastrados" value={kpis.totalProjetos} Icon={ChartLine} accent="var(--primary)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <div className="bg-white border rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <div className="serif text-base font-semibold tracking-[-0.01em]">
                Projetos por programa
              </div>
              <div className="text-xs text-muted-foreground">
                Quantidade de projetos ativos por sigla de programa
              </div>
            </div>
          </div>
          <div className="p-4">
            {programaChart.length > 0 ? (
              <BarChartCard data={programaChart} nameKey="label" />
            ) : (
              <EmptyChart label="Nenhum projeto cadastrado ainda." />
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div className="serif text-base font-semibold tracking-[-0.01em]">
              Distribuição por tipo
            </div>
          </div>
          <div className="p-4">
            {tipoChart.length > 0 ? (
              <PieChartCard data={tipoChart} />
            ) : (
              <EmptyChart label="Sem dados ainda." />
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="serif text-base font-semibold tracking-[-0.01em]">
            Últimos projetos cadastrados
          </div>
          <Link
            href="/projetos"
            className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
          >
            Ver todos <ArrowRight size={13} />
          </Link>
        </div>
        <div className="overflow-auto">
          {ultimos.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Nenhum projeto cadastrado ainda.
            </div>
          ) : (
            <table className="w-full text-[13.5px]">
              <thead className="bg-[#FBFAF6]">
                <tr className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="text-left font-medium px-4 py-3">Projeto</th>
                  <th className="text-left font-medium px-4 py-3">Tipo</th>
                  <th className="text-left font-medium px-4 py-3">Coordenador</th>
                  <th className="text-left font-medium px-4 py-3">Campus</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {ultimos.map((p) => (
                  <tr key={p._id} className="border-t border-line-2 hover:bg-[#FBFAF6]">
                    <td className="px-4 py-3.5 max-w-[320px]">
                      <Link href={`/projetos/${p._id}`} className="block">
                        <div className="font-medium truncate">{p.titulo}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-primary-tint text-primary text-[11px] font-semibold">
                        {p.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.coordenador ? (
                        <span className="flex items-center gap-2">
                          <Avatar nome={p.coordenador} size="sm" />
                          <span className="text-xs">{p.coordenador}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs">{p.campus}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
