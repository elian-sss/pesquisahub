import { requireAuth } from "@/lib/auth/session";
import { DashboardAdmin } from "@/components/dashboard/DashboardAdmin";
import { DashboardCoordenador } from "@/components/dashboard/DashboardCoordenador";
import { DashboardBolsista } from "@/components/dashboard/DashboardBolsista";

export default async function DashboardPage() {
  const user = await requireAuth();

  if (user.role === "ADMIN") return <DashboardAdmin />;
  if (user.role === "COORDENADOR") {
    return <DashboardCoordenador usuarioId={user.usuario_id} />;
  }
  return <DashboardBolsista usuarioId={user.usuario_id} />;
}
