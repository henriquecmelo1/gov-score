import * as z from "zod";

export const saleSchema = z.object({
  id: z.string(),
  entidade_devedora: z.string(),
  valor_nf: z.number().positive("Valor deve ser positivo"),
  data_entrega: z.iso.datetime(),
  status: z.enum(["Pago", "Pendente"]),
  itens_quantidade: z.string(),
  nf_url: z.string().nullable().optional(),
  contrato_url: z.string().nullable().optional(),
});

export type Sale = z.infer<typeof saleSchema>;
