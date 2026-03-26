import { PaymentMethod } from "@/generated/prisma/enums";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  card: "Cartão",
  boleto: "Boleto",
  transfer: "Transferência",
};

export const paymentMethodOptions = [
  { value: "pix", label: "PIX" },
  { value: "cash", label: "Dinheiro" },
  { value: "card", label: "Cartão" },
  { value: "boleto", label: "Boleto" },
  { value: "transfer", label: "Transferência" },
];
