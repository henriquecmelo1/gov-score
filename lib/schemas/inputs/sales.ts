import { z } from "zod";

export const saleSchema = z.object({
  entidade_devedora: z.string().min(1, "Selecione um cliente"),
  itens_quantidade: z.string().min(1, "Descreva os itens"),
  valor_nf: z.string().min(1, "O valor é obrigatório"),
  data_entrega: z.string().min(1, "A data de entrega é obrigatória"),
  numero_ordem: z.string().min(1, "O número da ordem é obrigatório"),
  nf_file: z.any().optional(),
  contrato_file: z.any().optional(),
});

export type SaleInput = z.infer<typeof saleSchema>;