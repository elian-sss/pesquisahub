"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "./Avatar";
import { firstAndLast, roleLabel } from "@/lib/ui-utils";
import type { Role } from "@/types";

export function UserMenu({ nome, email, role }: { nome: string; email: string; role: Role }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="profile-switcher">
        <span className="role-pill">{roleLabel(role)}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Avatar nome={nome} size="sm" />
          <span className="desktop-only">{firstAndLast(nome)}</span>
        </span>
        <ChevronDown size={14} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[240px]">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{nome}</span>
          <span className="text-xs text-muted-foreground font-normal">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ redirectTo: "/login" })}>
          <LogOut size={14} />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
