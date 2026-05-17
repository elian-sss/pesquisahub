import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/config";

const { auth } = NextAuth(authConfig);

// Rotas restritas por role. As demais sob (dashboard) so exigem autenticacao.
const ADMIN_ONLY = ["/usuarios"];

const PUBLIC_PATHS = ["/login"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const path = nextUrl.pathname;

  const isPublic = PUBLIC_PATHS.includes(path);
  const isAuthed = !!session?.user;

  // Nao autenticado tentando entrar em rota privada -> /login
  if (!isAuthed && !isPublic) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(loginUrl);
  }

  // Autenticado tentando entrar em /login -> dashboard
  if (isAuthed && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Rotas restritas por role
  if (isAuthed && ADMIN_ONLY.some((p) => path.startsWith(p))) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  // Exclui api/auth, assets do Next, favicon, public files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
