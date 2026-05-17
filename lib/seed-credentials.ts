// Credenciais dos usuarios de seed, compartilhadas entre o seed (Fase 6)
// e o login de demonstracao (botoes de acesso rapido). Manter alinhado
// com o que sera persistido em scripts/seed.ts.

export const SEED_PASSWORD = "pesquisahub2026";

export const QUICK_LOGIN = {
  admin: {
    email: "admin@ufopa.edu.br",
    senha: SEED_PASSWORD,
    nome: "Beatriz Souza",
    sub: "PROPESP · Pró-Reitoria de Pesquisa",
  },
  coord: {
    email: "maria.silva@ufopa.edu.br",
    senha: SEED_PASSWORD,
    nome: "Profa. Maria Silva",
    sub: "Coordenadora · Engenharia Elétrica",
  },
  bolsista: {
    email: "joao.pereira@aluno.ufopa.edu.br",
    senha: SEED_PASSWORD,
    nome: "João Pereira",
    sub: "Bolsista PIBIC · Eng. Computação",
  },
} as const;

export type QuickLoginKey = keyof typeof QUICK_LOGIN;
