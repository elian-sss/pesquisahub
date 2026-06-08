// Barrel para registrar todos os modelos em uma unica importacao.
// Importe deste arquivo em Server Actions e scripts para garantir
// que cada modelo foi registrado antes de qualquer query.
export { UsuarioModel } from "./Usuario";
export { ProgramaModel } from "./Programa";
export { UnidadeAcademicaModel } from "./UnidadeAcademica";
export { ProjetoModel } from "./Projeto";

export type { Usuario, RegistroHoras } from "./Usuario";
export type { Programa } from "./Programa";
export type { UnidadeAcademica } from "./UnidadeAcademica";
export type { Projeto, ArquivoEmbed } from "./Projeto";
