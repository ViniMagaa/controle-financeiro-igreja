import { prisma } from "@/lib/prisma";

export const suppliersService = {
  async list() {
    return prisma.supplier.findMany({ orderBy: { name: "asc" } });
  },

  async create(name: string) {
    return prisma.supplier.create({ data: { name } });
  },

  async delete(id: string) {
    const count = await prisma.transaction.count({
      where: { supplierId: id },
    });

    if (count > 0) {
      throw new Error(
        `Fornecedor possui ${count} transação(ões) vinculada(s) e não pode ser removido`,
      );
    }

    return prisma.supplier.delete({ where: { id } });
  },
};
