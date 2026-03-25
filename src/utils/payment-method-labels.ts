import { PaymentMethod } from "@/generated/prisma/enums";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  card: "Cartão",
  boleto: "Boleto",
  transfer: "Transferência",
};
