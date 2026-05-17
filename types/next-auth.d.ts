import type { Role } from "@/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      usuario_id: string;
    };
  }

  interface User {
    role: Role;
    usuario_id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    usuario_id: string;
  }
}
