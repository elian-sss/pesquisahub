import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectMongo } from "@/lib/db/connection";
import { UsuarioModel } from "@/models/Usuario";
import { loginSchema } from "@/lib/validators/usuario";
import { authConfig } from "./config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse({
          email: credentials?.email,
          senha: credentials?.senha,
        });
        if (!parsed.success) return null;

        await connectMongo();
        const usuario = await UsuarioModel.findOne({ email: parsed.data.email })
          .select("+senha_hash")
          .lean();
        if (!usuario) return null;

        const ok = await bcrypt.compare(parsed.data.senha, usuario.senha_hash);
        if (!ok) return null;

        return {
          id: String(usuario._id),
          email: usuario.email,
          name: usuario.nome,
          role: usuario.role,
          usuario_id: String(usuario._id),
        };
      },
    }),
  ],
});
