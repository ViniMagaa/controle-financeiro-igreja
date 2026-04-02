import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId");
    const month = searchParams.get("month")
      ? Number(searchParams.get("month"))
      : undefined;
    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : undefined;

    if (!supplierId) {
      return NextResponse.json(
        { error: "Fornecedor é obrigatório" },
        { status: 400 },
      );
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Fornecedor não encontrado" },
        { status: 404 },
      );
    }

    const dateFilter =
      month && year
        ? { gte: new Date(year, month - 1, 1), lt: new Date(year, month, 1) }
        : undefined;

    const transactions = await prisma.transaction.findMany({
      where: {
        supplierId,
        type: "expense",
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      orderBy: { date: "asc" },
    });

    const total = transactions.reduce((acc, t) => acc + Number(t.amount), 0);

    return NextResponse.json({
      supplierId: supplier.id,
      supplierName: supplier.name,
      total,
      transactions: transactions.map((t) => ({
        id: t.id,
        date: t.date,
        responsibleName: t.responsibleName,
        amount: Number(t.amount),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
