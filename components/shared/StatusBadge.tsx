import type { StatusEntrega, StatusMeta, StatusProjeto } from "@/types";

type AnyStatus = StatusProjeto | StatusMeta | StatusEntrega;

const VARIANT: Record<AnyStatus, { cls: string; label: string }> = {
  planejado: { cls: "sb-plan", label: "Planejado" },
  em_andamento: { cls: "sb-ok", label: "Em andamento" },
  concluido: { cls: "sb-ok", label: "Concluído" },
  atrasado: { cls: "sb-bad", label: "Atrasado" },
  cancelado: { cls: "sb-plan", label: "Cancelado" },
  pendente: { cls: "sb-warn", label: "Pendente" },
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  const v = VARIANT[status];
  return <span className={`status-badge ${v.cls}`}>{v.label}</span>;
}
