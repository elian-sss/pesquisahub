import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { connectMongo } from "@/lib/db/connection";
import { ProgramaModel } from "@/models/Programa";
import { UnidadeAcademicaModel } from "@/models/UnidadeAcademica";
import { UsuarioModel } from "@/models/Usuario";
import { NovoProjetoForm } from "./novo-form";

export default async function NovoProjetoPage() {
  const user = await requireAuth();
  if (user.role === "BOLSISTA") redirect("/projetos");

  await connectMongo();
  const [programas, unidades, usuarios] = await Promise.all([
    ProgramaModel.find({ ativo: true }, { sigla: 1, nome_completo: 1, tipo: 1 }).lean(),
    UnidadeAcademicaModel.find(
      {},
      { sigla: 1, nome: 1, campus: 1 },
    ).lean(),
    UsuarioModel.find({}, { nome: 1, role: 1, categoria: 1 }).lean(),
  ]);

  return (
    <NovoProjetoForm
      programas={programas.map((p) => ({
        _id: String(p._id),
        sigla: p.sigla,
        nome_completo: p.nome_completo,
        tipo: p.tipo,
      }))}
      unidades={unidades.map((u) => ({
        _id: String(u._id),
        sigla: u.sigla,
        nome: u.nome,
        campus: u.campus,
      }))}
      usuarios={usuarios.map((u) => ({
        _id: String(u._id),
        nome: u.nome,
        role: u.role,
        categoria: u.categoria,
      }))}
    />
  );
}
