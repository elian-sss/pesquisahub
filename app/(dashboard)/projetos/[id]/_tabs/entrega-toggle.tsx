"use client";

import { useTransition } from "react";
import { Check, Circle } from "lucide-react";
import { toast } from "sonner";
import { atualizarStatusEntrega } from "@/lib/actions/projetos";
import type { StatusEntrega } from "@/types";

export function EntregaToggle({
  projetoId,
  metaId,
  entregaId,
  status,
  canEdit,
}: {
  projetoId: string;
  metaId: string;
  entregaId: string;
  status: StatusEntrega;
  canEdit: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const isDone = status === "concluido";

  const toggle = () => {
    if (!canEdit) return;
    const next: StatusEntrega = isDone ? "pendente" : "concluido";
    startTransition(async () => {
      const res = await atualizarStatusEntrega({
        projeto_id: projetoId,
        meta_id: metaId,
        entrega_id: entregaId,
        status: next,
      });
      if (!res.ok) toast.error(res.error);
      else toast.success(isDone ? "Entrega reaberta" : "Entrega concluída");
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!canEdit || pending}
      className={
        "w-5 h-5 rounded-full border-2 grid place-items-center transition flex-shrink-0 " +
        (isDone
          ? "bg-[color:var(--ok)] border-[color:var(--ok)]"
          : "border-muted-foreground hover:border-primary") +
        (canEdit ? " cursor-pointer" : " cursor-not-allowed opacity-60")
      }
      aria-label={isDone ? "Reabrir entrega" : "Marcar como concluída"}
    >
      {isDone ? <Check size={12} color="white" /> : <Circle size={8} className="text-transparent" />}
    </button>
  );
}
