import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

export type SupplierSchema = z.infer<typeof supplierSchema>;
