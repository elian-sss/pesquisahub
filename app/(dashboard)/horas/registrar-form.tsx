"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TIPOS_HORAS, type TipoHoras } from "@/types";
import { registrarHoras } from "@/lib/actions/horas";

const inputCls =
  "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

export function RegistrarHorasForm({
  projetos,
}: {
  projetos: Array<{ _id: string; titulo: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    projeto_id: "",
    data: new Date().toISOString().split("T")[0],
    horas: 4,
    tipo: "pesquisa" as TipoHoras,
    atividade: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await registrarHoras(form);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Horas registradas. Aguardando aprovação.");
      setForm({ ...form, atividade: "", horas: 4 });
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">Projeto *</span>
        <select
          className={inputCls}
          value={form.projeto_id}
          onChange={(e) => setForm({ ...form, projeto_id: e.target.value })}
          required
        >
          <option value="">Selecione</option>
          {projetos.map((p) => (
            <option key={p._id} value={p._id}>
              {p.titulo}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium">Data *</span>
          <input
            type="date"
            className={inputCls}
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
            required
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium">Horas *</span>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            className={inputCls}
            value={form.horas}
            onChange={(e) => setForm({ ...form, horas: Number(e.target.value) })}
            required
          />
        </label>
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">Tipo *</span>
        <select
          className={inputCls}
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoHoras })}
        >
          {TIPOS_HORAS.map((t) => (
            <option key={t} value={t} className="capitalize">
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium">Atividade *</span>
        <textarea
          className={inputCls + " min-h-[80px]"}
          value={form.atividade}
          onChange={(e) => setForm({ ...form, atividade: e.target.value })}
          placeholder="O que foi feito"
          required
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-[color:var(--primary-deep)] disabled:opacity-50"
      >
        {pending ? "Registrando..." : "Registrar horas"}
      </button>
    </form>
  );
}
