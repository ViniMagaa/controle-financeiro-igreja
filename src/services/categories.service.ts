import { prisma } from "@/lib/prisma";

export const categoriesService = {
  async list() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  },

  async create(name: string) {
    return prisma.category.create({ data: { name } });
  },

  async delete(id: string) {
    // Verifica se há transações vinculadas antes de deletar
    const count = await prisma.transaction.count({
      where: { categoryId: id },
    });

    if (count > 0) {
      throw new Error(
        `Categoria possui ${count} transação(ões) vinculada(s) e não pode ser removida`,
      );
    }

    return prisma.category.delete({ where: { id } });
  },
};
