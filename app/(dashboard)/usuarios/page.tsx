import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { connectMongo } from "@/lib/db/connection";
import { UsuarioModel } from "@/models/Usuario";
import { ProjetoModel } from "@/models/Projeto";
import { Avatar } from "@/components/shared/Avatar";
import { roleLabel } from "@/lib/ui-utils";

const CATEGORIA_LABEL: Record<string, string> = {
  docente: "Docente",
  tecnico_administrativo: "Técnico-administrativo",
  discente_graduacao: "Discente — Graduação",
  discente_pos: "Discente — Pós",
  externo: "Externo",
};

export default async function UsuariosPage() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") redirect("/dashboard");

  await connectMongo();
  const usuarios = await UsuarioModel.find()
    .populate("unidade_academica_id", "sigla nome")
    .sort({ role: 1, nome: 1 })
    .lean();

  // Contagem de projetos por usuario (multikey index { "equipe.usuario_id": 1 })
  const contagens = await ProjetoModel.aggregate<{ _id: string; count: number }>([
    { $unwind: "$equipe" },
    { $group: { _id: "$equipe.usuario_id", count: { $sum: 1 } } },
  ]);
  const projetosPorUsuario = new Map(
    contagens.map((c) => [String(c._id), c.count]),
  );

  return (
    <div className="bg-white border rounded-xl">
      <div className="px-5 py-4 border-b">
        <div className="serif text-base font-semibold tracking-[-0.01em]">
          Usuários da plataforma
        </div>
        <div className="text-xs text-muted-foreground">
          {usuarios.length} pessoa{usuarios.length === 1 ? "" : "s"} cadastrada{usuarios.length === 1 ? "" : "s"}
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-[13.5px]">
          <thead className="bg-[#FBFAF6]">
            <tr className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              <th className="text-left font-medium px-4 py-3">Pessoa</th>
              <th className="text-left font-medium px-4 py-3">Papel</th>
              <th className="text-left font-medium px-4 py-3">Categoria</th>
              <th className="text-left font-medium px-4 py-3">Unidade</th>
              <th className="text-left font-medium px-4 py-3">E-mail</th>
              <th className="text-right font-medium px-4 py-3">Projetos</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => {
              const unidade = u.unidade_academica_id as
                | { sigla?: string; nome?: string }
                | null
                | undefined;
              return (
                <tr key={String(u._id)} className="border-t border-line-2 hover:bg-[#FBFAF6]">
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-3">
                      <Avatar nome={u.nome} size="sm" />
                      <div>
                        <div className="font-medium text-sm">{u.nome}</div>
                        {u.curso && (
                          <div className="text-xs text-muted-foreground">
                            {u.curso}
                          </div>
                        )}
                      </div>
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-primary-tint text-primary text-[11px] font-semibold">
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    {CATEGORIA_LABEL[u.categoria] ?? u.categoria}
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    {unidade?.sigla ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted-foreground">
                    {u.email}
                  </td>
                  <td className="px-4 py-3.5 tnum text-xs text-right">
                    {projetosPorUsuario.get(String(u._id)) ?? 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
