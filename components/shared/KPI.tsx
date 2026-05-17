import type { LucideIcon } from "lucide-react";

export function KPI({
  label,
  value,
  foot,
  footKind,
  Icon,
  accent,
}: {
  label: string;
  value: string | number;
  foot?: string;
  footKind?: "up" | "down";
  Icon?: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="bg-white border rounded-xl p-5 flex flex-col gap-2.5">
      <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
        {Icon && <Icon size={13} />}
        {label}
      </div>
      <div
        className="serif tnum text-[32px] font-medium leading-none tracking-[-0.02em]"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      {foot && (
        <div
          className={
            "text-[11.5px] " +
            (footKind === "up"
              ? "text-[color:var(--ok)]"
              : footKind === "down"
                ? "text-[color:var(--bad)]"
                : "text-muted-foreground")
          }
        >
          {foot}
        </div>
      )}
    </div>
  );
}
