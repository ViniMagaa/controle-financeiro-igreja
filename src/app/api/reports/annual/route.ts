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
    const year = Number(searchParams.get("year"));

    if (!year) {
      return NextResponse.json({ error: "Ano é obrigatório" }, { status: 400 });
    }

    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);

    // Transações do ano
    const currentTransactions = await prisma.transaction.findMany({
      where: { date: { gte: yearStart, lt: yearEnd } },
    });

    // Tudo antes do ano — para o saldo anterior
    const prevTransactions = await prisma.transaction.findMany({
      where: { date: { lt: yearStart } },
    });

    const previousYearBalance =
      prevTransactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + Number(t.amount), 0) -
      prevTransactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + Number(t.amount), 0);

    // Agrupa por mês
    const months = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthTx = currentTransactions.filter(
        (t) => new Date(t.date).getMonth() + 1 === month,
      );
      return {
        month,
        income: monthTx
          .filter((t) => t.type === "income")
          .reduce((acc, t) => acc + Number(t.amount), 0),
        expense: monthTx
          .filter((t) => t.type === "expense")
          .reduce((acc, t) => acc + Number(t.amount), 0),
      };
    });

    const totalIncome = currentTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const totalExpense = currentTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + Number(t.amount), 0);

    const balance = previousYearBalance + totalIncome - totalExpense;

    return NextResponse.json({
      year,
      previousYearBalance,
      months,
      totalIncome,
      totalExpense,
      balance,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
