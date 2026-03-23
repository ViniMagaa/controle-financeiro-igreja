import { PaymentMethod, TransactionType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type TransactionFilters = {
  type?: TransactionType;
  categoryId?: string;
  month?: number;
  year?: number;
};

export const transactionsService = {
  async list(filters: TransactionFilters = {}) {
    const where: Record<string, unknown> = {};

    if (filters.type) where.type = filters.type;
    if (filters.categoryId) where.categoryId = filters.categoryId;

    if (filters.month && filters.year) {
      const start = new Date(filters.year, filters.month - 1, 1);
      const end = new Date(filters.year, filters.month, 1);
      where.date = { gte: start, lt: end };
    }

    return prisma.transaction.findMany({
      where,
      include: { category: true, supplier: true },
      orderBy: { date: "desc" },
    });
  },

  async create(data: {
    type: TransactionType;
    description: string;
    amount: number;
    date: string;
    responsibleName: string;
    supplierId?: string;
    paymentMethod: PaymentMethod;
    categoryId: string;
  }) {
    return prisma.transaction.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
      include: { category: true, supplier: true },
    });
  },

  async delete(id: string) {
    return prisma.transaction.delete({ where: { id } });
  },

  async getSummary(month: number, year: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const transactions = await prisma.transaction.findMany({
      where: { date: { gte: start, lt: end } },
    });

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    return { income, expense, balance: income - expense };
  },
};
