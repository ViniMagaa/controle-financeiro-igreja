"use client";

import { Button } from "@/components/ui/button";
import { Category } from "@/generated/prisma/client";
import { api } from "@/lib/api";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import {
  LoaderCircle,
  Plus,
  Trash,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const paymentMethodLabels: Record<string, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  card: "Cartão",
  boleto: "Boleto",
  transfer: "Transferência",
};

type Transaction = {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: string;
  date: string;
  responsibleName: string;
  supplierName: string | null;
  paymentMethod: string;
  category: Category;
};

const now = new Date();

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (categoryId) params.categoryId = categoryId;
    if (month) params.month = month;
    if (year) params.year = year;

    const { data, error } = await api.get<Transaction[]>("/api/transactions", {
      params,
    });
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    setTransactions(data ?? []);
    setLoading(false);
  }, [type, categoryId, month, year]);

  useEffect(() => {
    api.get<Category[]>("/api/categories").then(({ data }) => {
      setCategories(data ?? []);
    });
  }, []);

  useEffect(() => {
    async function fetch() {
      fetchTransactions();
    }
    fetch();
  }, [fetchTransactions, type, categoryId, month, year]);

  async function handleDelete(id: string) {
    toast("Remover esta transação?", {
      action: {
        label: "Sim, remover",
        onClick: async () => {
          const { error } = await api.delete(`/api/transactions/${id}`);
          if (error) {
            toast.error(error);
            return;
          }
          toast.success("Transação removida!");
          fetchTransactions();
        },
      },
    });
  }

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Entradas e saídas registradas
          </p>
        </div>
        <Link href="/transactions/new">
          <Button className="gap-1.5">
            <Plus className="size-4" />
            Nova transação
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border-border bg-background focus:ring-ring rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2"
        >
          <option value="">Todos os tipos</option>
          <option value="income">Entradas</option>
          <option value="expense">Saídas</option>
        </select>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border-border bg-background focus:ring-ring rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border-border bg-background focus:ring-ring rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2"
        >
          <option value="">Todos os meses</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(2000, i).toLocaleString("pt-BR", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border-border bg-background focus:ring-ring rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2"
        >
          <option value="">Todos os anos</option>
          {[
            now.getFullYear() - 2,
            now.getFullYear() - 1,
            now.getFullYear(),
          ].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Totais do período filtrado */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          {
            label: "Entradas",
            value: totalIncome,
            color: "text-green-600 dark:text-green-400",
          },
          {
            label: "Saídas",
            value: totalExpense,
            color: "text-red-600 dark:text-red-400",
          },
          {
            label: "Saldo",
            value: totalIncome - totalExpense,
            color: "text-blue-600 dark:text-blue-400",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="border-border rounded-lg border px-4 py-3"
          >
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className={`mt-0.5 text-base font-semibold ${color}`}>
              {formatCurrency(value)}
            </p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoaderCircle className="text-muted-foreground size-5 animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border p-8 text-center text-sm">
          Nenhuma transação encontrada para os filtros selecionados.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {transactions.map((t) => (
            <li
              key={t.id}
              className="border-border flex items-start justify-between gap-4 rounded-lg border px-4 py-3"
            >
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
                    {t.supplierName && ` → ${t.supplierName}`}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
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
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5!"
                >
                  <Trash className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
