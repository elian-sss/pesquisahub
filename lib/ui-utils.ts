import type { Role } from "@/types";

const AVATAR_PALETTE = [
  "#0F4C5C",
  "#5B7C7E",
  "#7D6B91",
  "#A87F3A",
  "#3B6E6F",
  "#8B4F4F",
  "#4F6B8B",
  "#9B6F3F",
] as const;

export function initials(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export function avatarColor(nome: string): string {
  let hash = 0;
  for (let i = 0; i < nome.length; i += 1) {
    hash = (hash * 31 + nome.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function roleLabel(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "COORDENADOR":
      return "Coordenador";
    case "BOLSISTA":
      return "Bolsista";
  }
}

export function firstAndLast(nome: string): string {
  const parts = nome.trim().split(/\s+/);
  if (parts.length <= 2) return parts.join(" ");
  return `${parts[0]} ${parts[parts.length - 1]}`;
}
