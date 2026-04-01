"use client";

import { Button } from "@/components/ui/button";
import { TransactionType } from "@/generated/prisma/enums";
import { api } from "@/lib/api";
import { Transaction } from "@/types/transaction.type";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { paymentMethodLabels } from "@/utils/payment-method";
import {
  ArrowLeft,
  ExternalLink,
  LoaderCircle,
  Pencil,
  Trash,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Transaction>(`/api/transactions/${id}`).then(({ data, error }) => {
      if (error) {
        toast.error(error);
        return;
      }
      setTransaction(data);
      setLoading(false);
    });
  }, [id]);

  function handleDelete() {
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
          router.push("/transactions");
        },
      },
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="text-muted-foreground size-5 animate-spin" />
      </main>
    );
  }

  if (!transaction) return null;

  const t = transaction;
  const isLinked = !!t.linkedBy;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <Link
          href="/transactions"
          className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-3.5" /> Voltar
        </Link>
      </div>

      {/* Valor + tipo */}
      <div className="border-border mb-6 flex items-center gap-3 rounded-lg border p-4">
        {!isLinked ? (
          <TransactionTypeIcon type={t.type} amount={t.amount} />
        ) : (
          <>
            <TransactionTypeIcon type="income" amount={t.amount} />
            {/* Separador */}
            <div className="border-border h-12 border-l border-dashed" />

            <TransactionTypeIcon type="expense" amount={t.amount} />
          </>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Link href={`/transactions/${t.id}/update`}>
            <Button variant="secondary" className="p-1.5!">
              <Pencil className="size-4" />
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="p-1.5!"
          >
            <Trash className="size-4" />
          </Button>
        </div>
      </div>

      {/* Detalhes */}
      <div className="border-border divide-border mb-6 divide-y rounded-lg border">
        <DetailRow label="Data" value={formatDate(t.date)} />
        {t.description && <DetailRow label="Descrição" value={t.description} />}
        <DetailRow label="Responsável" value={t.responsibleName} />
        <DetailRow
          label="Forma de pagamento"
          value={paymentMethodLabels[t.paymentMethod]}
        />
        {t.supplier?.name && (
          <DetailRow label="Fornecedor" value={t.supplier.name} />
        )}
      </div>

      {/* Arquivos */}
      {(t.attachmentUrl || t.invoiceUrl) && (
        <div className="border-border divide-border divide-y rounded-lg border">
          {t.attachmentUrl && (
            <FileRow label="Comprovante" url={t.attachmentUrl} />
          )}
          {t.invoiceUrl && <FileRow label="Nota fiscal" url={t.invoiceUrl} />}
        </div>
      )}
    </main>
  );
}

function TransactionTypeIcon({
  type,
  amount,
}: {
  type: TransactionType;
  amount: Transaction["amount"];
}) {
  const isIncome = type === "income";
  return (
    <>
      <div
        className={`rounded-md p-2 ${
          isIncome
            ? "bg-green-50 dark:bg-green-950/30"
            : "bg-red-50 dark:bg-red-950/30"
        }`}
      >
        {isIncome ? (
          <TrendingUp className="size-4 text-green-600 dark:text-green-400" />
        ) : (
          <TrendingDown className="size-4 text-red-600 dark:text-red-400" />
        )}
      </div>
      <div>
        <p className="text-muted-foreground text-xs">
          {isIncome ? "Entrada" : "Saída"}
        </p>
        <p
          className={`text-2xl font-semibold ${
            isIncome
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(Number(amount))}
        </p>
      </div>
    </>
  );
}

// Linha de detalhe genérica
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

// Linha de arquivo com link externo
function FileRow({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <p className="text-muted-foreground text-sm">{label}</p>
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
      >
        Visualizar
        <ExternalLink className="size-3.5" />
      </Link>
    </div>
  );
}
