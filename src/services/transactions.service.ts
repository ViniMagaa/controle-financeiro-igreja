import type { PaymentMethod, TransactionType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type TransactionFilters = {
  type?: TransactionType;
  categoryId?: string;
  supplierId?: string;
  month?: number;
  year?: number;
};

type CreateTransactionData = {
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  responsibleName: string;
  supplierId?: string;
  paymentMethod: PaymentMethod;
  categoryId: string;
  attachmentUrl?: string | null;
  invoiceUrl?: string | null;
};

export const transactionsService = {
  async findById(id: string) {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        linkedBy: {
          include: { category: true, supplier: true },
        },
      },
    });
  },

  async list(filters: TransactionFilters = {}) {
    const where: Record<string, unknown> = {};

    if (filters.type) {
      where.OR = [
        { type: filters.type },
        { linkedBy: { type: filters.type } },
        { linkedTransaction: { type: filters.type } },
      ];
    }
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.supplierId) where.supplierId = filters.supplierId;

    if (filters.month && filters.year) {
      const start = new Date(filters.year, filters.month - 1, 1);
      const end = new Date(filters.year, filters.month, 1);
      where.date = { gte: start, lt: end };
    }

    if (!filters.month && filters.year) {
      const start = new Date(filters.year, 0 - 1, 1);
      const end = new Date(filters.year, 11, 1);
      where.date = { gte: start, lt: end };
    }

    return prisma.transaction.findMany({
      where,
      include: {
        category: true,
        supplier: true,
        linkedTransaction: {
          include: { category: true, supplier: true },
        },
        linkedBy: {
          include: { category: true, supplier: true },
        },
      },
      orderBy: { date: "desc" },
    });
  },

  async create(data: CreateTransactionData) {
    return prisma.transaction.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
      include: { category: true, supplier: true },
    });
  },

  async createLinked(data: CreateTransactionData) {
    return prisma.$transaction(async (tx) => {
      // Cria a saída primeiro
      const expense = await tx.transaction.create({
        data: {
          ...data,
          date: new Date(data.date),
          type: "expense",
        },
      });

      // Cria a entrada já vinculada à saída
      const income = await tx.transaction.create({
        data: {
          ...data,
          date: new Date(data.date),
          type: "income",
          linkedTransactionId: expense.id,
        },
        include: { category: true, supplier: true },
      });

      return { transaction1: expense, transaction2: income };
    });
  },

  async getFileUrls(id: string): Promise<string[]> {
    // Primeiro busca a transação para descobrir o par vinculado
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      select: {
        attachmentUrl: true,
        invoiceUrl: true,
        linkedTransactionId: true,
        linkedBy: { select: { id: true } },
      },
    });

    if (!transaction) return [];

    const urls: string[] = [];

    console.log(transaction);

    // URLs da transação principal
    if (transaction.attachmentUrl) urls.push(transaction.attachmentUrl);
    if (transaction.invoiceUrl) urls.push(transaction.invoiceUrl);

    // ID do par vinculado (pode estar em linkedTransactionId ou linkedBy)
    const linkedId =
      transaction.linkedTransactionId ?? transaction.linkedBy?.id;

    if (linkedId) {
      const linked = await prisma.transaction.findUnique({
        where: { id: linkedId },
        select: { attachmentUrl: true, invoiceUrl: true },
      });
      if (linked?.attachmentUrl) urls.push(linked.attachmentUrl);
      if (linked?.invoiceUrl) urls.push(linked.invoiceUrl);
    }

    return urls;
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

  async update(id: string, data: Partial<CreateTransactionData>) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: { linkedBy: true },
      });

      if (!transaction) throw new Error("Transação não encontrada");

      const updated = await tx.transaction.update({
        where: { id },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
          supplierId: data.type === "expense" ? data.supplierId : null,
        },
        include: { category: true, supplier: true },
      });

      // Se tem par vinculado (entrada), espelha os campos compartilhados
      const linkedId = transaction.linkedBy?.id;

      if (linkedId) {
        await tx.transaction.update({
          where: { id: linkedId },
          data: {
            description: data.description,
            amount: data.amount,
            date: data.date ? new Date(data.date) : undefined,
            categoryId: data.categoryId,
            responsibleName: data.responsibleName,
            paymentMethod: data.paymentMethod,
            attachmentUrl: data.attachmentUrl,
            invoiceUrl: data.invoiceUrl,
          },
        });
      }

      return updated;
    });
  },

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id },
        include: { linkedTransaction: true, linkedBy: true },
      });

      if (!transaction) throw new Error("Transação não encontrada");

      // Encontra o id do par vinculado (pode estar em linkedTransactionId ou linkedBy)
      const linkedId =
        transaction.linkedTransactionId ?? transaction.linkedBy?.id;

      if (linkedId) {
        // Quebra o vínculo antes de deletar para evitar foreign key error
        await tx.transaction.updateMany({
          where: { id: { in: [id, linkedId] } },
          data: { linkedTransactionId: null },
        });

        // Deleta as duas
        await tx.transaction.deleteMany({
          where: { id: { in: [id, linkedId] } },
        });
      } else {
        await tx.transaction.delete({ where: { id } });
      }
    });
  },
};
