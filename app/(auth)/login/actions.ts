"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { QUICK_LOGIN, type QuickLoginKey } from "@/lib/seed-credentials";

export type LoginResult = { error: string } | undefined;

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");

  try {
    await signIn("credentials", {
      email,
      senha,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Credenciais inválidas. Verifique e tente novamente." };
    }
    // Re-throw NEXT_REDIRECT para o Next processar o redirect
    throw error;
  }
}

export async function quickLoginAction(role: QuickLoginKey): Promise<LoginResult> {
  const creds = QUICK_LOGIN[role];
  try {
    await signIn("credentials", {
      email: creds.email,
      senha: creds.senha,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: `Usuário de demo "${role}" ainda não foi criado. Rode "npm run seed" primeiro.`,
      };
    }
    throw error;
  }
}
