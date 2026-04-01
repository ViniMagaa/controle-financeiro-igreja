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
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));

    if (!month || !year) {
      return NextResponse.json(
        { error: "Mês e ano são obrigatórios" },
        { status: 400 },
      );
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    // Transações do mês atual
    const currentTransactions = await prisma.transaction.findMany({
      where: { date: { gte: start, lt: end } },
      include: { supplier: true },
      orderBy: { date: "asc" },
    });

    // Transações do mês anterior — para calcular saldo
    const prevTransactions = await prisma.transaction.findMany({
      where: { date: { lt: start } }, // tudo antes do mês atual
    });

    // Calcula totais do mês anterior
    const prevIncome = prevTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const prevExpense = prevTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const previousBalance = prevIncome - prevExpense;

    // Calcula totais do mês atual
    const incomeTransactions = currentTransactions.filter(
      (t) => t.type === "income",
    );
    const expenseTransactions = currentTransactions.filter(
      (t) => t.type === "expense",
    );

    const totalIncome = incomeTransactions.reduce(
      (acc, t) => acc + Number(t.amount),
      0,
    );
    const totalExpense = expenseTransactions.reduce(
      (acc, t) => acc + Number(t.amount),
      0,
    );

    const expenseBySupplier = expenseTransactions.reduce(
      (acc, t) => {
        const key = t.supplierId ?? t.responsibleName;
        if (!acc[key]) {
          acc[key] = {
            id: key,
            supplierName: t.supplier?.name ?? t.responsibleName,
            amount: 0,
          };
        }
        acc[key].amount += Number(t.amount);
        return acc;
      },
      {} as Record<
        string,
        { id: string; supplierName: string; amount: number }
      >,
    );

    // Total de entradas inclui saldo anterior
    const totalEntradas = previousBalance + totalIncome;
    const balance = totalEntradas - totalExpense;

    return NextResponse.json({
      month,
      year,
      previousBalance,
      totalIncome,
      totalExpense,
      totalEntradas,
      balance,
      incomeTransactions: incomeTransactions.map((t) => ({
        id: t.id,
        date: t.date,
        description: t.description,
        amount: Number(t.amount),
        responsibleName: t.responsibleName,
      })),
      expenseTransactions: Object.values(expenseBySupplier),
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
