import { ExternalLink } from "lucide-react";
import type { ProjetoDetalhe } from "@/lib/queries/projetos";

const fmt = (d: Date) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function OverviewTab({ projeto }: { projeto: ProjetoDetalhe }) {
  const meta = projeto.metadados_programa;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
      <div className="flex flex-col gap-4">
        <Card title="Programa de fomento">
          <Row label="Programa">
            {projeto.programa
              ? `${projeto.programa.sigla} — ${projeto.programa.nome_completo}`
              : "—"}
          </Row>
          <Row label="Unidade acadêmica">
            {projeto.unidade ? `${projeto.unidade.sigla} — ${projeto.unidade.nome}` : "—"}
          </Row>
          <Row label="Campus">{projeto.campus}</Row>
          <Row label="Vigência">
            {fmt(projeto.vigencia.inicio)} → {fmt(projeto.vigencia.fim)}
          </Row>
          {projeto.sigaa_id && <Row label="ID SIGAA">{projeto.sigaa_id}</Row>}
        </Card>

        <Card title={`Metadados — ${projeto.tipo}`} sub="Campos específicos do tipo deste projeto">
          <MetadadosRender tipo={projeto.tipo} meta={meta} />
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card title="Recursos">
          {projeto.recursos.repositorio_git && (
            <a
              href={projeto.recursos.repositorio_git}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink size={14} /> Repositório Git
            </a>
          )}
          {projeto.recursos.drive && (
            <a
              href={projeto.recursos.drive}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink size={14} /> Drive
            </a>
          )}
          {(projeto.recursos.outros ?? []).map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink size={14} /> {r.nome}
            </a>
          ))}
          {!projeto.recursos.repositorio_git &&
            !projeto.recursos.drive &&
            (projeto.recursos.outros ?? []).length === 0 && (
              <div className="text-sm text-muted-foreground">
                Nenhum recurso vinculado.
              </div>
            )}
        </Card>

        {projeto.vigencia.prorrogacoes.length > 0 && (
          <Card title="Prorrogações">
            {projeto.vigencia.prorrogacoes.map((pr, i) => (
              <div key={i} className="text-sm">
                <div className="font-medium">→ {fmt(pr.nova_data_fim)}</div>
                <div className="text-xs text-muted-foreground">{pr.motivo}</div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

function Card({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-xl">
      <div className="px-5 py-4 border-b">
        <div className="serif text-base font-semibold tracking-[-0.01em]">{title}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
      <div className="p-5 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
      <div className="text-xs uppercase tracking-[0.06em] text-muted-foreground font-medium w-40 flex-shrink-0">
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function MetadadosRender({
  tipo,
  meta,
}: {
  tipo: string;
  meta: Record<string, unknown>;
}) {
  // Render simples: percorre as chaves de metadados_programa.
  // O componente especifico de UI por tipo no formulario (MetadadosProgramaFields)
  // e o ponto principal da demo; aqui mostramos os valores ja salvos.
  const entries = Object.entries(meta);
  if (entries.length === 0) {
    return <div className="text-sm text-muted-foreground">Sem metadados.</div>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {entries.map(([k, v]) => (
        <div key={k}>
          <div className="text-xs uppercase tracking-[0.06em] text-muted-foreground font-medium mb-0.5">
            {k.replace(/_/g, " ")}
          </div>
          <div className="text-sm">{formatValue(v)}</div>
        </div>
      ))}
      <div className="col-span-full text-xs text-muted-foreground italic mt-2">
        Tipo: {tipo} · Estes campos são salvos em <code>metadados_programa</code>{" "}
        como <code>Schema.Types.Mixed</code> — sem necessidade de migration ao
        adicionar campos novos.
      </div>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  if (typeof v === "number") return v.toLocaleString("pt-BR");
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(formatValue).join(", ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
