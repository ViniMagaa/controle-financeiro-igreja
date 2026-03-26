import { LinkedSide, Transaction } from "@/types/transaction.type";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { paymentMethodLabels } from "@/utils/payment-method";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

type LinkedTransactionItemProps = {
  expense: Transaction;
  income: LinkedSide;
  onDelete?: () => void;
};

export function LinkedTransactionItem({
  expense,
  income,
  onDelete,
}: LinkedTransactionItemProps) {
  return (
    <li className="border-border overflow-hidden rounded-lg border">
      {/* Entrada — doação */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="shrink-0 rounded-md bg-green-50 p-1.5 dark:bg-green-950/30">
          <ArrowDownLeft className="size-3.5 text-green-600 dark:text-green-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">
            <span className="text-foreground font-medium">
              {income.responsibleName}
            </span>
            {" · "}
            {paymentMethodLabels[income.paymentMethod]}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-green-600 dark:text-green-400">
          +{formatCurrency(Number(expense.amount))}
        </span>
      </div>

      {/* Separador */}
      <div className="border-border mx-4 border-t border-dashed" />

      {/* Saída — pagamento ao fornecedor */}
      <div className="flex items-center gap-3 px-4 py-2.5">
        <div className="shrink-0 rounded-md bg-red-50 p-1.5 dark:bg-red-950/30">
          <ArrowUpRight className="size-3.5 text-red-600 dark:text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{expense.description}</p>
          <p className="text-muted-foreground text-xs">
            {expense.supplier?.name && `${expense.supplier.name} · `}
            {expense.category.name} ·{" "}
            {paymentMethodLabels[expense.paymentMethod]} ·{" "}
            {formatDate(expense.date)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-semibold text-red-600 dark:text-red-400">
            -{formatCurrency(Number(expense.amount))}
          </span>
          {onDelete && (
            <div className="flex shrink-0 items-center gap-1">
              <Link href={`/transactions/${income.id}/update`}>
                <Button variant="secondary" className="p-1.5!">
                  <Pencil className="size-4" />
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={onDelete}
                className="p-1.5!"
              >
                <Trash className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
