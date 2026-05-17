import { z } from "zod";
import { CATEGORIAS, ROLES } from "@/types";
import {
  academicoSchema,
  contatoSchema,
  dadosBancariosSchema,
  enderecoSchema,
  objectIdString,
  preferenciasSchema,
} from "./embeds";

export const loginSchema = z.object({
  email: z.string().email("E-mail invalido"),
  senha: z.string().min(1, "Senha obrigatoria"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const usuarioCreateSchema = z.object({
  nome: z.string().min(2, "Minimo 2 caracteres"),
  email: z.string().email("E-mail invalido").toLowerCase().trim(),
  senha: z.string().min(8, "Minimo 8 caracteres"),
  role: z.enum(ROLES),
  categoria: z.enum(CATEGORIAS),
  matricula: z.string().trim().optional(),
  curso: z.string().optional(),
  unidade_academica_id: objectIdString.optional(),
  campus: z.string().optional(),
  contato: contatoSchema.optional(),
  endereco: enderecoSchema.optional(),
  dados_bancarios: dadosBancariosSchema.optional(),
  academico: academicoSchema.optional(),
  preferencias: preferenciasSchema.optional(),
});
export type UsuarioCreateInput = z.infer<typeof usuarioCreateSchema>;

export const usuarioUpdateSchema = usuarioCreateSchema.partial().omit({
  senha: true,
});
export type UsuarioUpdateInput = z.infer<typeof usuarioUpdateSchema>;
