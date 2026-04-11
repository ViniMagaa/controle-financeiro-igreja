import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { TransactionsList } from "@/components/transactions-list";
import { transactionsService } from "@/services/transactions.service";
import { Transaction } from "@/types/transaction.type";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [summary, recentTransactions] = await Promise.all([
    transactionsService.getSummary(),
    transactionsService.list({ limit: 10 }),
  ]);

  const visibleTransactions = (
    JSON.parse(JSON.stringify(recentTransactions)) as Transaction[]
  ).filter((t) => !t.linkedBy);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Resumo financeiro da construção
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total de entradas"
          value={summary.income}
          type="income"
        />
        <SummaryCard
          title="Total de saídas"
          value={summary.expense}
          type="expense"
        />
        <SummaryCard
          title="Saldo atual"
          value={summary.balance}
          type="balance"
        />
      </div>

      {/* Gráficos — client component com seletor de ano */}
      <DashboardCharts />

      {/* Movimentações recentes */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-medium">Movimentações recentes</h2>
          <Link
            href="/transactions"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
          >
            Ver todas
            <ArrowRight className="size-3" />
          </Link>
        </div>

        {visibleTransactions.length === 0 ? (
          <div className="border-border text-muted-foreground rounded-lg border p-8 text-center text-sm">
            Nenhuma movimentação registrada ainda.
          </div>
        ) : (
          <TransactionsList transactions={visibleTransactions} />
        )}
      </div>
    </main>
  );
}
