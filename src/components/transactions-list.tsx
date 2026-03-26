"use client";

import { Transaction } from "@/types/transaction.type";
import { LinkedTransactionItem } from "./transactions/linked-transaction-items";
import { SimpleTransactionItem } from "./transactions/simple-transaction-item";

type TransactionsListProps = {
  transactions: Transaction[];
  handleDelete?: (id: string) => void;
};

export function TransactionsList({
  transactions,
  handleDelete,
}: TransactionsListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {transactions.map((t) => {
        const isLinked = !!t.linkedTransaction;

        // Par vinculado — entrada é o linkedTransaction da saída
        const expense = t; // sempre a saída na lista raiz
        const income = t.linkedTransaction; // entrada vinculada

        const onDelete = !!handleDelete ? () => handleDelete(t.id) : undefined;

        if (isLinked && income) {
          return (
            <LinkedTransactionItem
              key={t.id}
              expense={expense}
              income={income}
              onDelete={onDelete}
            />
          );
        }

        // Transação simples
        return (
          <SimpleTransactionItem
            key={t.id}
            transaction={t}
            onDelete={onDelete}
          />
        );
      })}
    </ul>
  );
}
