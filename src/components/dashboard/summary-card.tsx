import { formatCurrency } from "@/utils/format-currency";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

type SummaryCardProps = {
  title: string;
  value: number;
  type: "income" | "expense" | "balance";
};

export function SummaryCard({ title, value, type }: SummaryCardProps) {
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

  return (
    <div className="border-border flex items-start gap-3 rounded-lg border p-4">
      <div className={`rounded-md p-2 ${bg}`}>
        <Icon className={`size-4 ${color}`} />
      </div>
      <div>
        <p className="text-muted-foreground text-xs">{title}</p>
        <p className="mt-0.5 text-2xl font-semibold">{formatCurrency(value)}</p>
      </div>
    </div>
  );
}
