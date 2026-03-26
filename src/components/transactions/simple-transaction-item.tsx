import { Transaction } from "@/types/transaction.type";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { paymentMethodLabels } from "@/utils/payment-method";
import { Pencil, Trash, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

type SimpleTransactionItemProps = {
  transaction: Transaction;
  onDelete: () => void;
};

export function SimpleTransactionItem({
  transaction: t,
  onDelete,
}: SimpleTransactionItemProps) {
  const router = useRouter();

  return (
    <li className="border-border flex items-start justify-between gap-4 rounded-lg border px-4 py-3">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 rounded-md p-1.5 ${
            t.type === "income"
              ? "bg-green-50 dark:bg-green-950/30"
              : "bg-red-50 dark:bg-red-950/30"
          }`}
        >
          {t.type === "income" ? (
            <TrendingUp className="size-3.5 text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown className="size-3.5 text-red-600 dark:text-red-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{t.description}</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {t.category.name} · {paymentMethodLabels[t.paymentMethod]} ·{" "}
            {formatDate(t.date)}
          </p>
          <p className="text-muted-foreground text-xs">
            {t.responsibleName}
            {t.supplier?.name && ` → ${t.supplier.name}`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span
          className={`text-sm font-semibold ${
            t.type === "income"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {t.type === "income" ? "+" : "-"}
          {formatCurrency(Number(t.amount))}
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="secondary"
            onClick={() => router.push(`/transactions/${t.id}/update`)}
            className="p-1.5!"
          >
            <Pencil className="size-4" />
          </Button>
          <Button variant="destructive" onClick={onDelete} className="p-1.5!">
            <Trash className="size-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}
