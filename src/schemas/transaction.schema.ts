import { z } from "zod";

// Tipo separado para o formulário (o que o RHF vê — campos como string)
export const transactionFormSchema = z.object({
  type: z.enum(["income", "expense"], {
    error: "Tipo é obrigatório",
  }),
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"), // string no form
  date: z.string().min(1, "Data é obrigatória"),
  responsibleName: z.string().min(1, "Responsável é obrigatório"),
  supplierName: z.string().optional(),
  paymentMethod: z.enum(["pix", "cash", "card", "boleto", "transfer"], {
    error: "Forma de pagamento é obrigatória",
  }),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
});

// Tipo separado para a API (o que o servidor recebe — amount como number)
export const transactionSchema = transactionFormSchema.extend({
  amount: z.coerce
    .number({ error: "Valor inválido" })
    .positive("Valor deve ser maior que zero"),
});

export type TransactionFormSchema = z.infer<typeof transactionFormSchema>;
export type TransactionSchema = z.infer<typeof transactionSchema>;
