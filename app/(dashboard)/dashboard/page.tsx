import { requireAuth } from "@/lib/auth/session";
import { roleLabel } from "@/lib/ui-utils";

// Placeholder: dashboards reais por role serao implementados na Fase 5
// (agregacoes MongoDB para Admin/Coordenador/Bolsista).
export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-6">
        <div className="serif text-xl font-medium">
          Bem-vindo(a), {user.name.split(" ")[0]}!
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Você está logado(a) como{" "}
          <span className="font-medium text-foreground">{roleLabel(user.role)}</span>.
          Os dashboards específicos por perfil chegam na próxima fase.
        </p>
      </div>
    </div>
  );
}
