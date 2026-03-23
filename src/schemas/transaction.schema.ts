import { z } from "zod";

export const transactionSchema = z
  .object({
    type: z.enum(["income", "expense"], {
      error: "Tipo é obrigatório",
    }),
    description: z.string().min(1, "Descrição é obrigatória"),
    amount: z
      .number({ error: "Valor é obrigatório" })
      .positive("Valor deve ser maior que zero"),
    date: z.string().min(1, "Data é obrigatória"),
    responsibleName: z.string().min(1, "Responsável é obrigatório"),
    supplierId: z.string().optional(),
    paymentMethod: z.enum(["pix", "cash", "card", "boleto", "transfer"], {
      error: "Forma de pagamento é obrigatória",
    }),
    categoryId: z
      .string("Categoria é obrigatória")
      .min(1, "Categoria é obrigatória"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "expense" && !data.supplierId) {
      ctx.addIssue({
        code: "custom",
        path: ["supplierId"],
        message: "Fornecedor é obrigatório",
      });
    }
  });

export const transactionFormSchema = transactionSchema.extend({
  isDirectPayment: z.boolean().optional(),
});

export type TransactionSchema = z.infer<typeof transactionSchema>;
export type TransactionFormSchema = z.infer<typeof transactionFormSchema>;
