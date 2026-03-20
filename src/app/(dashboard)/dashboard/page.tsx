import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/dashboard/header";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

// Server Component — busca dados no servidor, sem useEffect
export default function DashboardPage() {
  // Placeholder — aqui virão os dados reais do banco futuramente
  const resumo = {
    entradas: 0,
    saidas: 0,
    saldo: 0,
  };

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
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
          value={resumo.entradas}
          type="income"
        />
        <SummaryCard
          title="Total de saídas"
          value={resumo.saidas}
          type="expense"
        />
        <SummaryCard title="Saldo atual" value={resumo.saldo} type="balance" />
      </div>

      {/* Placeholder para transações recentes */}
      <div className="mt-8">
        <h2 className="mb-3 text-base font-medium">Movimentações recentes</h2>
        <div className="border-border text-muted-foreground rounded-lg border p-8 text-center text-sm">
          Nenhuma movimentação registrada ainda.
        </div>
      </div>
    </main>
  );
}

// Componente interno — só usado nessa página, não precisa de arquivo separado ainda
type SummaryCardProps = {
  title: string;
  value: number;
  type: "income" | "expense" | "balance";
};

function SummaryCard({ title, value, type }: SummaryCardProps) {
  const config = {
    income: {
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    expense: {
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    balance: {
      icon: Wallet,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
  };

  const { icon: Icon, color, bg } = config[type];

  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

  return (
    <div className="border-border flex items-start gap-3 rounded-lg border p-4">
      <div className={`rounded-md p-2 ${bg}`}>
        <Icon className={`size-4 ${color}`} />
      </div>
      <div>
        <p className="text-muted-foreground text-xs">{title}</p>
        <p className="mt-0.5 text-2xl font-semibold">{formatted}</p>
      </div>
    </div>
  );
}
