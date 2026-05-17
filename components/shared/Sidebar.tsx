"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Clock,
  FolderOpen,
  Home,
  LogOut,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { BrandLogo } from "./BrandMark";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  Icon: LucideIcon;
  roles?: Role[];
  badge?: number;
}

const PRINCIPAL: NavItem[] = [
  { href: "/dashboard", label: "Painel", Icon: Home },
  { href: "/projetos", label: "Projetos", Icon: FolderOpen },
  { href: "/cronograma", label: "Cronograma", Icon: Calendar },
  { href: "/horas", label: "Horas", Icon: Clock },
  { href: "/relatorios", label: "Relatórios", Icon: BarChart3 },
];

const ADMIN: NavItem[] = [
  { href: "/usuarios", label: "Usuários", Icon: Users, roles: ["ADMIN"] },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <BrandLogo />

      <div className="nav-section">
        <div className="nav-label">Principal</div>
        {PRINCIPAL.filter((i) => !i.roles || i.roles.includes(role)).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive(pathname, item.href) ? "active" : ""}`}
          >
            <item.Icon size={16} />
            <span>{item.label}</span>
            {item.badge != null && <span className="nav-badge">{item.badge}</span>}
          </Link>
        ))}

        {role === "ADMIN" && (
          <>
            <div className="nav-label" style={{ marginTop: 12 }}>
              Administração
            </div>
            {ADMIN.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive(pathname, item.href) ? "active" : ""}`}
              >
                <item.Icon size={16} />
                <span>{item.label}</span>
              </Link>
            ))}
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <button type="button" className="nav-item" disabled>
          <Settings size={16} />
          <span>Configurações</span>
        </button>
        <button
          type="button"
          className="nav-item"
          onClick={() => signOut({ redirectTo: "/login" })}
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
