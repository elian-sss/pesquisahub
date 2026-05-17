import { requireAuth } from "@/lib/auth/session";
import { listarHoras } from "@/lib/queries/horas";
import { connectMongo } from "@/lib/db/connection";
import { Types } from "mongoose";
import { ProjetoModel } from "@/models/Projeto";
import { RegistrarHorasForm } from "./registrar-form";
import { HorasList } from "./horas-list";

export default async function HorasPage() {
  const user = await requireAuth();

  await connectMongo();
  // Lista de projetos para o select do form (so projetos que o usuario participa)
  const meusProjetos = await ProjetoModel.find(
    {
      "equipe.usuario_id": new Types.ObjectId(user.usuario_id),
      status: { $ne: "cancelado" },
    },
    { titulo: 1 },
  ).lean();

  const registros = await listarHoras({
    usuario_id: user.usuario_id,
    role: user.role,
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
        {user.role !== "ADMIN" && (
          <div className="bg-white border rounded-xl p-5">
            <div className="serif text-base font-semibold tracking-[-0.01em] mb-4">
              Registrar horas
            </div>
            <RegistrarHorasForm
              projetos={meusProjetos.map((p) => ({
                _id: String(p._id),
                titulo: p.titulo,
              }))}
            />
          </div>
        )}

        <div className={user.role === "ADMIN" ? "lg:col-span-2" : ""}>
          <HorasList registros={registros} canApprove={user.role === "COORDENADOR"} />
        </div>
      </div>
    </div>
  );
}
