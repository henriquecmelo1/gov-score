import * as z from "zod";

export const debtorCreateSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").trim().toLowerCase(),
  city: z.string().trim().nullable().optional(),
  state: z.string().trim().nullable().optional(),
  // `user_id` is supplied server-side from the authenticated session
});

export const debtorUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().email("E-mail inválido").trim().toLowerCase().optional(),
  city: z.string().trim().nullable().optional(),
  state: z.string().trim().nullable().optional(),
});

export const debtorSchema = z.object({
  id: z.string(),
  name: z.string().trim(),
  email: z.string().email().trim().toLowerCase(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  user_id: z.string(),
  created_at: z.string().nullable().optional(),
});

export type Debtor = z.infer<typeof debtorSchema>;
export type DebtorCreateInput = z.infer<typeof debtorCreateSchema>;
export type DebtorUpdateInput = z.infer<typeof debtorUpdateSchema>;

export default debtorSchema;
