"use client";

import { TransactionsList } from "@/components/transactions-list";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Supplier } from "@/generated/prisma/client";
import { api } from "@/lib/api";
import { Transaction } from "@/types/transaction.type";
import { formatCurrency } from "@/utils/format-currency";
import { LoaderCircle, Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const now = new Date();

const typeOptions = [
  { value: "", label: "Todos os tipos" },
  { value: "income", label: "Entradas" },
  { value: "expense", label: "Saídas" },
];

const monthOptions = [{ value: "", label: "Todos os meses" }].concat(
  Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(2000, i)
      .toLocaleString("pt-BR", { month: "long" })
      .toLocaleUpperCase(),
  })),
);

const yearOptions = [{ value: "", label: "Todos os anos" }].concat(
  Array.from({ length: 4 }, (_, i) => {
    const year = now.getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  }),
);

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [responsibleName, setResponsibleName] = useState("");

  const fetchTransactions = useCallback(async () => {
    if (month && !year) return;
    setLoading(true);
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (supplierId) params.supplierId = supplierId;
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
  }, [type, supplierId, month, year]);

  useEffect(() => {
    api.get<Supplier[]>("/api/suppliers").then(({ data, error }) => {
      if (error) {
        toast.error(error);
        return;
      }
      setSuppliers(data ?? []);
    });
  }, []);

  useEffect(() => {
    async function fetch() {
      fetchTransactions();
    }
    fetch();
  }, [fetchTransactions, type, month, year]);

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

  function clearFilters() {
    setType("");
    setSupplierId("");
    setMonth("");
    setYear("");
    setResponsibleName("");
  }

  // Filtra transações vinculadas para não mostrar as duas separadas
  // Mostra apenas a "expense" (saída) que tem linkedTransaction (entrada)
  // A entrada vinculada (linkedBy) é omitida da lista raiz
  const visibleTransactions = useMemo(
    () =>
      transactions.filter((t) => {
        // Se tem linkedBy, significa que é a entrada de um par — oculta da lista raiz
        if (t.linkedBy) return false;
        return t.responsibleName
          .toLocaleLowerCase()
          .includes(responsibleName.toLocaleLowerCase());
      }),
    [transactions, responsibleName],
  );

  const supplierOptions = [
    { value: "", label: "Todos os fornecedores" },
  ].concat(suppliers.map((c) => ({ value: c.id, label: c.name })));

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-2 max-sm:flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transações</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Entradas e saídas registradas
          </p>
        </div>
        <Link href="/transactions/new" className="max-sm:w-full">
          <Button className="w-full gap-1.5">
            <Plus className="size-4" />
            Nova transação
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {/* Tipo */}
        <Select
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={typeOptions}
        />

        {/* Mês */}
        <Select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          options={monthOptions}
        />

        <div className="flex flex-col">
          {/* Ano */}
          <Select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            options={yearOptions}
            error={!!(month && !year)}
          />
          {month && !year && <FormError message="Selecione o ano" />}
        </div>

        {/* Fornecedor */}
        <Combobox
          options={supplierOptions}
          value={supplierId}
          onChange={(value) => setSupplierId(value)}
          emptyMessage="Nenhum fornecedor encontrado"
        />

        <Input
          value={responsibleName}
          onChange={(e) => setResponsibleName(e.target.value)}
          placeholder="Nome do responsável"
        />

        <Button variant="secondary" className="w-full" onClick={clearFilters}>
          Limpar filtros
        </Button>
      </div>

      {!loading && (
        <>
          {/* Totais do período filtrado */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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

          {visibleTransactions.length <= 0 ? (
            <div className="border-border text-muted-foreground rounded-lg border p-8 text-center text-sm">
              Nenhuma transação encontrada para os filtros selecionados.
            </div>
          ) : (
            <h2 className="font-medium">
              Exibindo {visibleTransactions.length} transações
            </h2>
          )}
        </>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoaderCircle className="text-muted-foreground size-5 animate-spin" />
        </div>
      ) : (
        <TransactionsList
          transactions={visibleTransactions}
          handleDelete={handleDelete}
        />
      )}
    </main>
  );
}
