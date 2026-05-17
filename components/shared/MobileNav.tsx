"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Clock,
  FolderOpen,
  Home,
  type LucideIcon,
} from "lucide-react";

interface Item {
  href: string;
  label: string;
  Icon: LucideIcon;
}

const ITEMS: Item[] = [
  { href: "/dashboard", label: "Painel", Icon: Home },
  { href: "/projetos", label: "Projetos", Icon: FolderOpen },
  { href: "/horas", label: "Horas", Icon: Clock },
  { href: "/cronograma", label: "Agenda", Icon: Calendar },
  { href: "/relatorios", label: "Relatórios", Icon: BarChart3 },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`bn-item ${isActive(pathname, item.href) ? "active" : ""}`}
        >
          <item.Icon size={19} />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
