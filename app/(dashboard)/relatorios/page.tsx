import { Download, FileText, BarChart3, PieChart as PieIcon } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import {
  getProjetosPorStatus,
  getProjetosPorTipo,
  getProjetosPorPrograma,
} from "@/lib/queries/dashboard";
import { BarChartCard, PieChartCard } from "@/components/dashboard/Charts";

export default async function RelatoriosPage() {
  await requireAuth();
  const [porTipo, porStatus, porPrograma] = await Promise.all([
    getProjetosPorTipo(),
    getProjetosPorStatus(),
    getProjetosPorPrograma(),
  ]);

  const tipoChart = porTipo.map((p) => ({ name: p.tipo, value: p.count }));
  const statusChart = porStatus.map((p) => ({ label: p.status, count: p.count }));
  const programaChart = porPrograma.map((p) => ({ label: p.sigla, count: p.count }));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ExportCard
          Icon={FileText}
          title="Relatório consolidado (PDF)"
          sub="Exportação não implementada nesta versão"
        />
        <ExportCard
          Icon={BarChart3}
          title="Planilha XLSX por projeto"
          sub="Exportação não implementada nesta versão"
        />
        <ExportCard
          Icon={PieIcon}
          title="Indicadores agregados"
          sub="Exportação não implementada nesta versão"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Projetos por tipo">
          {tipoChart.length > 0 ? (
            <PieChartCard data={tipoChart} />
          ) : (
            <Empty />
          )}
        </Card>
        <Card title="Projetos por status">
          {statusChart.length > 0 ? (
            <BarChartCard data={statusChart} nameKey="label" />
          ) : (
            <Empty />
          )}
        </Card>
      </div>

      <Card title="Projetos por programa de fomento">
        {programaChart.length > 0 ? (
          <BarChartCard data={programaChart} nameKey="label" />
        ) : (
          <Empty />
        )}
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-xl">
      <div className="px-5 py-4 border-b">
        <div className="serif text-base font-semibold tracking-[-0.01em]">{title}</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Empty() {
  return (
    <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
      Sem dados ainda.
    </div>
  );
}

function ExportCard({
  Icon,
  title,
  sub,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      disabled
      className="bg-white border rounded-xl p-4 flex items-start gap-3 text-left disabled:opacity-60"
    >
      <span className="w-9 h-9 rounded-lg grid place-items-center bg-primary-tint text-primary flex-shrink-0">
        <Icon size={16} />
      </span>
      <div className="flex-1">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <Download size={14} className="text-muted-foreground flex-shrink-0 mt-1" />
    </button>
  );
}
