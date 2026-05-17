import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requireAuth } from "@/lib/auth/session";
import { listarProjetos } from "@/lib/queries/projetos";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TIPOS_PROJETO, STATUS_PROJETO } from "@/types";
import type { StatusProjeto, TipoProjeto } from "@/types";

type SearchParams = Promise<{
  tipo?: string;
  status?: string;
  q?: string;
}>;

export default async function ProjetosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireAuth();
  const sp = await searchParams;

  const tipo = TIPOS_PROJETO.includes(sp.tipo as TipoProjeto)
    ? (sp.tipo as TipoProjeto)
    : undefined;
  const status = STATUS_PROJETO.includes(sp.status as StatusProjeto)
    ? (sp.status as StatusProjeto)
    : undefined;
  const q = sp.q?.trim() || undefined;

  const projetos = await listarProjetos(
    { tipo, status, q },
    { usuario_id: user.usuario_id, role: user.role },
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-white border rounded-xl p-4">
        <form className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por título"
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <select
            name="tipo"
            defaultValue={tipo ?? ""}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="">Todos os tipos</option>
            {TIPOS_PROJETO.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option value="">Todos os status</option>
            {STATUS_PROJETO.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-[color:var(--primary-deep)]"
          >
            Filtrar
          </button>
          {user.role !== "BOLSISTA" && (
            <Link
              href="/projetos/novo"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-accent text-[#1A1A1A] rounded-lg text-sm font-semibold hover:bg-[#d9a52d]"
            >
              <Plus size={15} /> Novo projeto
            </Link>
          )}
        </form>
      </div>

      {projetos.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-muted-foreground">
          <div className="font-medium text-foreground mb-1">
            Nenhum projeto encontrado
          </div>
          <div className="text-xs">
            Tente ajustar os filtros ou cadastrar um novo projeto.
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-auto">
          <table className="w-full text-[13.5px]">
            <thead className="bg-[#FBFAF6]">
              <tr className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                <th className="text-left font-medium px-4 py-3">Projeto</th>
                <th className="text-left font-medium px-4 py-3">Tipo</th>
                <th className="text-left font-medium px-4 py-3">Coordenador</th>
                <th className="text-left font-medium px-4 py-3">Programa</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3 w-[140px]">
                  Progresso
                </th>
              </tr>
            </thead>
            <tbody>
              {projetos.map((p) => (
                <tr key={p._id} className="border-t border-line-2 hover:bg-[#FBFAF6]">
                  <td className="px-4 py-3.5 max-w-[360px]">
                    <Link
                      href={`/projetos/${p._id}`}
                      className="block font-medium hover:text-primary truncate"
                    >
                      {p.titulo}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {p.unidade?.sigla ?? "—"} · {p.campus}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-primary-tint text-primary text-[11px] font-semibold">
                      {p.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    {p.coordenador ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    {p.programa?.sigla ?? "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-line-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${p.progresso_pct}%` }}
                        />
                      </div>
                      <span className="tnum text-xs text-muted-foreground w-8 text-right">
                        {p.progresso_pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
