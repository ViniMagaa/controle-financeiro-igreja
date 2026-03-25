import { Category, PaymentMethod, Supplier } from "@/generated/prisma/client";

export type Transaction = {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: string;
  date: string;
  responsibleName: string;
  supplier: Supplier | null;
  paymentMethod: PaymentMethod;
  category: Category;
  linkedTransactionId: string | null;
  linkedTransaction: LinkedSide | null;
  linkedBy: LinkedSide | null;
};

export type LinkedSide = {
  id: string;
  type: "income" | "expense";
  responsibleName: string;
  supplier: Supplier;
  paymentMethod: PaymentMethod;
};
