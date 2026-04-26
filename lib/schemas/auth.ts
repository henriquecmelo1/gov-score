import * as z from "zod";

export const registerSchema = z.object({
  email: z.string().email("E-mail inválido").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "A senha deve conter letras e números"),
  razao_social: z.string().trim().min(3, "Razão social é obrigatória"),
  cnpj: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 14, "CNPJ deve ter 14 números"),
  endereco: z.string().trim().min(5, "Endereço obrigatório"),
  telefone: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length >= 10 && value.length <= 11, "Telefone deve ter 10 ou 11 dígitos"),
});


export const loginSchema = z.object({
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
    password: z.string().min(1, "A senha é obrigatória"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;