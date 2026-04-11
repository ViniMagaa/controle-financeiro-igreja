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
    const year = Number(searchParams.get("year") ?? new Date().getFullYear());

    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);

    // Tudo antes do ano para calcular saldo inicial acumulado
    const prevTransactions = await prisma.transaction.findMany({
      where: { date: { lt: yearStart } },
      select: { type: true, amount: true },
    });

    const prevBalance =
      prevTransactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + Number(t.amount), 0) -
      prevTransactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + Number(t.amount), 0);

    // Transações do ano
    const transactions = await prisma.transaction.findMany({
      where: { date: { gte: yearStart, lt: yearEnd } },
      include: { supplier: true },
      orderBy: { date: "asc" },
    });

    const MONTHS = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    // Agrupa por mês
    const byMonth = Array.from({ length: 12 }, (_, i) => {
      const monthTx = transactions.filter(
        (t) => new Date(t.date).getMonth() === i,
      );
      const income = monthTx
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + Number(t.amount), 0);
      const expense = monthTx
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + Number(t.amount), 0);
      return { month: MONTHS[i], income, expense };
    });

    // Linha: saldo mês a mês (acumulado)
    let runningBalance = prevBalance;
    const lineData = byMonth.map(({ month, income, expense }) => {
      runningBalance += income - expense;
      return { month, balance: Math.round(runningBalance * 100) / 100 };
    });

    // Barras: entradas vs saídas por mês
    const barData = byMonth.map(({ month, income, expense }) => ({
      month,
      income: Math.round(income * 100) / 100,
      expense: Math.round(expense * 100) / 100,
    }));

    // Donut: top 5 fornecedores por valor total pago no ano
    const supplierMap = new Map<string, { name: string; total: number }>();
    transactions
      .filter((t) => t.type === "expense" && t.supplier)
      .forEach((t) => {
        const id = t.supplierId!;
        const existing = supplierMap.get(id);
        if (existing) {
          existing.total += Number(t.amount);
        } else {
          supplierMap.set(id, {
            name: t.supplier!.name,
            total: Number(t.amount),
          });
        }
      });

    const donutData = Array.from(supplierMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(({ name, total }) => ({
        name,
        total: Math.round(total * 100) / 100,
      }));

    return NextResponse.json({ lineData, barData, donutData, year });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
