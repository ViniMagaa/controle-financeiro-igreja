import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    error: "Tipo é obrigatório",
  }),
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z
    .number({ error: "Valor inválido" })
    .positive("Valor deve ser maior que zero"),
  date: z.string().min(1, "Data é obrigatória"),
  responsibleName: z.string().min(1, "Responsável é obrigatório"),
  supplierName: z.string().optional(),
  paymentMethod: z.enum(["pix", "cash", "card", "boleto", "transfer"], {
    error: "Forma de pagamento é obrigatória",
  }),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
});

export type TransactionSchema = z.infer<typeof transactionSchema>;
