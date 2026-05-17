import { requireAuth } from "@/lib/auth/session";
import { Sidebar } from "@/components/shared/Sidebar";
import { Topbar } from "@/components/shared/Topbar";
import { MobileNav } from "@/components/shared/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="app-shell">
      <Sidebar role={user.role} />
      <div className="app-main">
        <Topbar
          user={{ nome: user.name, email: user.email, role: user.role }}
        />
        <div className="app-content">{children}</div>
      </div>
      <MobileNav />
    </div>
  );
}
