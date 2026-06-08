import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { getProjetoPorId } from "@/lib/queries/projetos";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { OverviewTab } from "./_tabs/overview";
import { CronogramaTab } from "./_tabs/cronograma";
import { HorasTab } from "./_tabs/horas";
import { ArquivosTab } from "./_tabs/arquivos";
import { EquipeTab } from "./_tabs/equipe";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ tab?: string }>;

const TABS = ["visao", "cronograma", "horas", "arquivos", "equipe"] as const;
type Tab = (typeof TABS)[number];

export default async function ProjetoPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const user = await requireAuth();
  const { id } = await params;
  const { tab } = await searchParams;

  const projeto = await getProjetoPorId(id, {
    usuario_id: user.usuario_id,
    role: user.role,
  });
  if (!projeto) notFound();

  const current: Tab = TABS.includes(tab as Tab) ? (tab as Tab) : "visao";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/projetos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Voltar para projetos
        </Link>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-full bg-primary-tint text-primary text-xs font-semibold">
            {projeto.tipo}
          </span>
          <StatusBadge status={projeto.status} />
        </div>
        <h1 className="serif text-2xl font-medium tracking-[-0.015em] mb-2">
          {projeto.titulo}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {projeto.descricao}
        </p>
      </div>

      <div className="border-b flex gap-1 overflow-x-auto">
        {[
          { key: "visao", label: "Visão geral" },
          { key: "cronograma", label: "Cronograma" },
          { key: "horas", label: "Horas" },
          { key: "arquivos", label: "Arquivos" },
          { key: "equipe", label: "Equipe" },
        ].map((t) => {
          const active = t.key === current;
          return (
            <Link
              key={t.key}
              href={`/projetos/${id}?tab=${t.key}`}
              className={
                "px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition whitespace-nowrap " +
                (active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground")
              }
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div>
        {current === "visao" && <OverviewTab projeto={projeto} />}
        {current === "cronograma" && (
          <CronogramaTab projeto={projeto} role={user.role} />
        )}
        {current === "horas" && <HorasTab projetoId={id} />}
        {current === "arquivos" && <ArquivosTab arquivos={projeto.arquivos} />}
        {current === "equipe" && <EquipeTab projeto={projeto} />}
      </div>
    </div>
  );
}
