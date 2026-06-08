import { File } from "lucide-react";
import type { ProjetoDetalhe } from "@/lib/queries/projetos";

const fmtDate = (d: Date) =>
  new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

// Arquivos agora vem embedados no projeto (carregados por getProjetoPorId),
// entao a aba apenas recebe a lista ja ordenada por props — sem query propria.
export function ArquivosTab({ arquivos }: { arquivos: ProjetoDetalhe["arquivos"] }) {
  if (arquivos.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-12 text-center text-muted-foreground">
        <File size={24} className="mx-auto mb-2 opacity-40" />
        <div className="font-medium text-foreground mb-1">
          Nenhum arquivo neste projeto
        </div>
        <div className="text-xs">
          Upload real não está implementado nesta versão (mock por enquanto).
        </div>
      </div>
    );
  }

  // Mais recentes primeiro (a query antiga ordenava por enviado_em desc).
  const ordenados = [...arquivos].sort(
    (a, b) => new Date(b.enviado_em).getTime() - new Date(a.enviado_em).getTime(),
  );

  return (
    <div className="bg-white border rounded-xl divide-y">
      {ordenados.map((a) => (
        <div key={a._id} className="px-5 py-4 flex items-center gap-3">
          <File size={20} className="text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{a.nome}</div>
            <div className="text-xs text-muted-foreground">
              {a.tipo_documento} · {fmtSize(a.tamanho_bytes)} · {fmtDate(a.enviado_em)}
              {a.metadata_arquivo?.versao && ` · v${a.metadata_arquivo.versao}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
