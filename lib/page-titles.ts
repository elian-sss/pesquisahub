import type { Role } from "@/types";

type TitleEntry = {
  title: string;
  sub: (role: Role) => string;
};

export const PAGE_TITLES: Record<string, TitleEntry> = {
  "/dashboard": {
    title: "Painel",
    sub: (role) =>
      role === "ADMIN"
        ? "Visão institucional · PROPESP"
        : role === "COORDENADOR"
          ? "Seus projetos e pendências"
          : "Suas tarefas e horas",
  },
  "/projetos": {
    title: "Projetos",
    sub: (role) =>
      role === "ADMIN"
        ? "Todos os projetos da instituição"
        : role === "COORDENADOR"
          ? "Projetos sob sua coordenação"
          : "Projetos dos quais você participa",
  },
  "/cronograma": {
    title: "Cronograma",
    sub: () => "Metas e entregas em andamento",
  },
  "/horas": {
    title: "Registro de horas",
    sub: (role) =>
      role === "COORDENADOR"
        ? "Aprove os registros da sua equipe"
        : "Acompanhe e registre suas horas",
  },
  "/relatorios": {
    title: "Relatórios",
    sub: () => "Exportações, indicadores e análises",
  },
  "/usuarios": {
    title: "Usuários",
    sub: () => "Gestão de pessoas e permissões",
  },
};

export function resolvePageTitle(pathname: string, role: Role) {
  // Match exato; fallback para o prefixo /projetos/... etc.
  const key = Object.keys(PAGE_TITLES).find(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!key) return { title: "PesquisaHub", sub: "" };
  const entry = PAGE_TITLES[key];
  return { title: entry.title, sub: entry.sub(role) };
}
