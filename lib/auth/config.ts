import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/types";

// Config base, edge-compatible. NAO importa Mongoose, bcrypt nem nada Node-only.
// Usada por middleware.ts e estendida em lib/auth/index.ts (provider Credentials).
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as Role;
        token.usuario_id = user.usuario_id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as Role;
        session.user.usuario_id = token.usuario_id as string;
      }
      return session;
    },
  },
  providers: [], // populado em lib/auth/index.ts
} satisfies NextAuthConfig;
