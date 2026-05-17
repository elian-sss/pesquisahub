"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Bookmark, ChevronRight, Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QUICK_LOGIN, type QuickLoginKey } from "@/lib/seed-credentials";
import { loginAction, quickLoginAction } from "./actions";

const QUICK_BUTTONS: Array<{
  key: QuickLoginKey;
  label: string;
  Icon: typeof Sparkles;
}> = [
  { key: "admin", label: "Entrar como Admin", Icon: Sparkles },
  { key: "coord", label: "Entrar como Coordenador", Icon: Bookmark },
  { key: "bolsista", label: "Entrar como Bolsista", Icon: User },
];

export function LoginForm() {
  const [pending, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<QuickLoginKey | "form" | null>(null);

  const submit = (formData: FormData) => {
    setBusyKey("form");
    startTransition(async () => {
      const res = await loginAction(formData);
      if (res?.error) toast.error(res.error);
      setBusyKey(null);
    });
  };

  const quick = (key: QuickLoginKey) => {
    setBusyKey(key);
    startTransition(async () => {
      const res = await quickLoginAction(key);
      if (res?.error) toast.error(res.error);
      setBusyKey(null);
    });
  };

  return (
    <>
      <h2 className="serif text-[28px] font-medium tracking-[-0.015em] mb-1.5">
        Entrar na sua conta
      </h2>
      <p className="text-muted-foreground mb-7 text-[13.5px]">
        Use seu e-mail institucional e a senha cadastrada.
      </p>

      <form action={submit} className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail institucional</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="seunome@ufopa.edu.br"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            name="senha"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-[color:var(--primary-deep)]"
          disabled={pending}
        >
          {busyKey === "form" ? "Entrando..." : "Entrar"}
          <ArrowRight size={15} />
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground tracking-[0.06em] uppercase font-medium">
          Acesso rápido — demo
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex flex-col gap-2">
        {QUICK_BUTTONS.map(({ key, label, Icon }) => {
          const info = QUICK_LOGIN[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => quick(key)}
              disabled={pending}
              className="w-full flex items-center gap-3 text-left px-3.5 py-3 border border-border rounded-lg bg-white hover:border-muted-foreground hover:shadow-sm transition disabled:opacity-50"
            >
              <span className="w-7 h-7 rounded-lg grid place-items-center bg-primary-tint text-primary">
                <Icon size={14} />
              </span>
              <div className="flex-1">
                <div className="text-[13px] font-medium">
                  {busyKey === key ? "Entrando..." : label}
                </div>
                <div className="text-xs text-muted-foreground">{info.sub}</div>
              </div>
              <ChevronRight size={14} className="text-muted-foreground" />
            </button>
          );
        })}
      </div>
    </>
  );
}
