import { LinkedSide, Transaction } from "@/types/transaction.type";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { paymentMethodLabels } from "@/utils/payment-method";
import { Pencil, Trash, TrendingDown, TrendingUp } from "lucide-react";
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
    <li className="border-border flex justify-between gap-3 overflow-hidden rounded-l border px-4 py-3">
      <div className="flex flex-1 items-center gap-4">
        {/* Entrada — doação */}
        <div className="flex items-center gap-3">
          <div
            className={
              "mt-0.5 rounded-md bg-green-50 p-1.5 dark:bg-green-950/30"
            }
          >
            <TrendingUp className="size-3.5 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-muted-foreground text-xs">
            {formatDate(expense.date)}
          </p>
          <p className="text-foreground text-sm font-medium">
            {income.responsibleName}
          </p>
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            +{formatCurrency(Number(expense.amount))}
          </span>
        </div>

        {/* Separador */}
        <div className="border-border h-full border-l border-dashed" />

        {/* Saída — pagamento ao fornecedor */}
        <div className="flex items-center gap-3">
          <div
            className={"mt-0.5 rounded-md bg-red-50 p-1.5 dark:bg-red-950/30"}
          >
            <TrendingDown className="size-3.5 text-red-600 dark:text-red-400" />
          </div>

          <p className="text-sm font-medium">
            {expense.supplier?.name && expense.supplier.name}
          </p>
          <p className="text-muted-foreground text-xs">
            {paymentMethodLabels[expense.paymentMethod]}
            {expense.description && " · " + expense.description}
          </p>
        </div>

        <span className="ml-auto text-sm font-semibold text-red-600 dark:text-red-400">
          -{formatCurrency(Number(expense.amount))}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onDelete && (
          <div className="flex shrink-0 items-center gap-1">
            <Link href={`/transactions/${income.id}/update`}>
              <Button variant="secondary" className="p-1.5!">
                <Pencil className="size-4" />
              </Button>
            </Link>
            <Button variant="destructive" onClick={onDelete} className="p-1.5!">
              <Trash className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
