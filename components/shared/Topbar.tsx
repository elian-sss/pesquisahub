"use client";

import { usePathname } from "next/navigation";
import { resolvePageTitle } from "@/lib/page-titles";
import { UserMenu } from "./UserMenu";
import type { Role } from "@/types";

export function Topbar({
  user,
}: {
  user: { nome: string; email: string; role: Role };
}) {
  const pathname = usePathname();
  const { title, sub } = resolvePageTitle(pathname, user.role);

  return (
    <header className="topbar">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="topbar-title">{title}</div>
        {sub && <div className="topbar-sub">{sub}</div>}
      </div>
      <div className="flex items-center gap-2.5">
        <UserMenu nome={user.nome} email={user.email} role={user.role} />
      </div>
    </header>
  );
}
