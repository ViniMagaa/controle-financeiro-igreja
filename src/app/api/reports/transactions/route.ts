import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma/enums";
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
    const type = (searchParams.get("type") as TransactionType) || null;
    const supplierId = searchParams.get("supplierId") || null;
    const responsibleName = searchParams.get("responsibleName") || null;
    const paymentMethod = searchParams.get("paymentMethod") || null;
    const month = searchParams.get("month")
      ? Number(searchParams.get("month"))
      : null;
    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : null;

    const where: Record<string, unknown> = {};

    if (type) where.type = type;
    if (supplierId) where.supplierId = supplierId;
    if (responsibleName) {
      where.responsibleName = {
        contains: responsibleName,
        mode: "insensitive",
      };
    }
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (month && year) {
      where.date = {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      };
    } else if (year) {
      where.date = {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { supplier: true },
      orderBy: [{ date: "asc" }, { responsibleName: "asc" }],
    });

    const total = transactions.reduce(
      (acc, t) =>
        t.type === "expense" ? acc - Number(t.amount) : acc + Number(t.amount),
      0,
    );

    let supplierName: string | null = null;
    if (supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: supplierId },
      });
      supplierName = supplier?.name ?? null;
    }

    return NextResponse.json({
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        date: t.date,
        responsibleName: t.responsibleName,
        supplierName: t.supplier?.name ?? null,
        paymentMethod: t.paymentMethod,
        amount: Number(t.amount),
      })),
      total,
      filters: { month, year, supplierId, supplierName, responsibleName, type },
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
