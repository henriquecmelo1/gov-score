import * as z from "zod";

export const registerSchema = z.object({
  email: z.email("E-mail inválido").trim().toLowerCase(),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  razao_social: z.string().min(3, "Razão social é obrigatória"),
  cnpj: z.string().length(14, "CNPJ deve ter 14 números"),
  endereco: z.string().min(5, "Endereço obrigatório"),
  telefone: z.string().min(10, "Telefone inválido"),
});


export const loginSchema = z.object({
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
    password: z.string().min(1, "A senha é obrigatória"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;