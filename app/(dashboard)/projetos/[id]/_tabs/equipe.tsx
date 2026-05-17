import { Avatar } from "@/components/shared/Avatar";
import type { ProjetoDetalhe } from "@/lib/queries/projetos";

const PAPEL_LABEL: Record<string, string> = {
  coordenador: "Coordenador(a)",
  monitor: "Monitor(a)",
  bolsista: "Bolsista",
  voluntario: "Voluntário(a)",
  colaborador: "Colaborador(a)",
};

const fmt = (d: Date) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function EquipeTab({ projeto }: { projeto: ProjetoDetalhe }) {
  return (
    <div className="bg-white border rounded-xl divide-y">
      {projeto.equipe.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground">
          Nenhum membro cadastrado na equipe.
        </div>
      ) : (
        projeto.equipe.map((m, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4">
            <Avatar nome={m.nome} size="lg" />
            <div className="flex-1">
              <div className="font-medium">{m.nome}</div>
              <div className="text-xs text-muted-foreground">
                {PAPEL_LABEL[m.papel] ?? m.papel} · {m.categoria}
                {m.tipo_vinculo && ` · ${m.tipo_vinculo}`}
                {m.carga_horaria_semanal && ` · ${m.carga_horaria_semanal}h/sem`}
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div>Desde {fmt(m.periodo.inicio)}</div>
              {m.periodo.fim && <div>até {fmt(m.periodo.fim)}</div>}
              {m.valor_bolsa != null && (
                <div className="tnum font-semibold text-foreground mt-1">
                  R$ {m.valor_bolsa.toLocaleString("pt-BR")}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
