import { Transaction } from "@/types/transaction.type";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { paymentMethodLabels } from "@/utils/payment-method";
import {
  MoveRight,
  Pencil,
  Trash,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

type SimpleTransactionItemProps = {
  transaction: Transaction;
  onDelete?: () => void;
};

export function SimpleTransactionItem({
  transaction: t,
  onDelete,
}: SimpleTransactionItemProps) {
  const router = useRouter();
  return (
    <li
      className="border-border hover:bg-muted/60 flex cursor-pointer items-start justify-between gap-4 rounded-lg border px-4 py-3 transition"
      onClick={() => router.push(`/transactions/${t.id}`)}
    >
      <div className="flex gap-3">
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
        <div className="flex items-center gap-3">
          <p className="text-muted-foreground text-xs">{formatDate(t.date)}</p>
          <div className="flex items-center gap-2 text-sm font-medium">
            {t.responsibleName}
            {t.supplier?.name && (
              <>
                <MoveRight className="size-4" /> {t.supplier.name}
              </>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            {paymentMethodLabels[t.paymentMethod]}
            {t.description && " · " + t.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
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
        {onDelete && (
          <div className="flex items-center gap-1">
            <Link href={`/transactions/${t.id}/update`}>
              <Button
                variant="secondary"
                className="p-1.5!"
                onClick={(e) => e.stopPropagation()}
              >
                <Pencil className="size-4" />
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="p-1.5!"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
