"use client";

import { Button } from "@/components/ui/button";
import { ComboboxField } from "@/components/ui/combobox-field";
import { CurrencyField } from "@/components/ui/currency-field";
import { FileUploadField } from "@/components/ui/file-upload-field";
import { Form } from "@/components/ui/form";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { SelectField } from "@/components/ui/select-field";
import { Category, Supplier } from "@/generated/prisma/client";
import { api } from "@/lib/api";
import { uploadFile } from "@/lib/supabase/storage.client";
import {
  TransactionFormSchema,
  transactionFormSchema,
} from "@/schemas/transaction.schema";
import { Transaction } from "@/types/transaction.type";
import { paymentMethodOptions } from "@/utils/payment-method";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowUpRight, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function UpdateTransactionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<TransactionFormSchema>({
    resolver: zodResolver(transactionFormSchema),
  });

  const {
    register,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  const type = watch("type");
  const isLinked = !!transaction?.linkedBy;

  useEffect(() => {
    Promise.all([
      api.get<Transaction>(`/api/transactions/${id}`),
      api.get<Category[]>("/api/categories"),
      api.get<Supplier[]>("/api/suppliers"),
    ]).then(([txRes, catRes, supRes]) => {
      if (txRes.error) {
        toast.error(txRes.error);
        return;
      }

      const t = txRes.data!;
      setTransaction(t);
      setCategories(catRes.data ?? []);
      setSuppliers(supRes.data ?? []);

      reset({
        type: t.type,
        description: t.description,
        amount: Number(t.amount),
        date: t.date.split("T")[0],
        responsibleName: t.responsibleName,
        supplierId: t.supplier?.id ?? undefined,
        paymentMethod: t.paymentMethod,
        categoryId: t.category.id,
      });

      setLoading(false);
    });
  }, [id, reset]);

  // useEffect(() => {
  //   if (type === "income") {
  //     setValue("supplierId", "");
  //   }
  // }, [type, setValue]);

  async function onSubmit(data: TransactionFormSchema) {
    let attachmentUrl = transaction?.attachmentUrl ?? null;
    let invoiceUrl = transaction?.invoiceUrl ?? null;
    let previousAttachmentUrl: string | null = null;
    let previousInvoiceUrl: string | null = null;

    if (data.attachmentFile) {
      const { url, error } = await uploadFile(
        data.attachmentFile,
        "attachments",
        "attachments",
      );
      if (error) {
        toast.error(`Erro ao enviar comprovante: ${error}`);
        return;
      }
      previousAttachmentUrl = transaction?.attachmentUrl ?? null;
      attachmentUrl = url;
    }

    if (data.invoiceFile) {
      const { url, error } = await uploadFile(
        data.invoiceFile,
        "attachments",
        "invoices",
      );
      if (error) {
        toast.error(`Erro ao enviar nota fiscal: ${error}`);
        return;
      }
      previousInvoiceUrl = transaction?.invoiceUrl ?? null;
      invoiceUrl = url;
    }

    const payload = {
      ...data,

      attachmentUrl,
      invoiceUrl,
      previousAttachmentUrl,
      previousInvoiceUrl,
      attachmentFile: undefined,
      invoiceFile: undefined,
    };

    const { error } = await api.patch(`/api/transactions/${id}`, payload);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Transação atualizada!");
    router.push("/transactions");
  }

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const supplierOptions = suppliers.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle className="text-muted-foreground size-5 animate-spin" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-8">
      <div className="mb-8">
        <Link
          href="/transactions"
          className="text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-3.5" /> Voltar
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">
          Editar transação
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Atualize os dados da transação
        </p>
      </div>

      <Form form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          {/* Badge de transação vinculada */}
          {isLinked && (
            <div className="text-muted-foreground border-border bg-muted/20 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <ArrowUpRight className="size-3.5 shrink-0" />
              Transação vinculada — alterações refletem na entrada e saída
            </div>
          )}

          {/* Tipo — desabilitado em vinculadas */}
          {!isLinked && (
            <div className="flex flex-col gap-1.5">
              <Label>
                Tipo <span className="text-destructive ml-0.5">*</span>
              </Label>
              <div className="flex gap-2">
                {(["expense", "income"] as const).map((t) => (
                  <label
                    key={t}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border py-2.5 text-sm transition ${
                      type === t
                        ? t === "income"
                          ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                        : "border-border hover:bg-muted/50"
                    } `}
                  >
                    <input
                      type="radio"
                      value={t}
                      className="sr-only"
                      {...register("type")}
                    />
                    {t === "income" ? "Entrada" : "Saída"}
                  </label>
                ))}
              </div>
              <FormError message={errors.type?.message} />
            </div>
          )}

          <FormField
            name="description"
            label="Descrição do material ou serviço"
            placeholder="Ex: Cimento 50kg, Mão de obra elétrica..."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <CurrencyField name="amount" label="Valor" required />
            <FormField name="date" label="Data" type="date" required />
          </div>

          <FormField
            name="responsibleName"
            label="Nome do responsável"
            placeholder="Quem realizou o pagamento ou doação"
            required
          />

          <ComboboxField
            name="categoryId"
            label="Categoria"
            options={categoryOptions}
            placeholder="Selecione uma categoria..."
            searchPlaceholder="Buscar categoria..."
            emptyMessage="Nenhuma categoria encontrada."
            required
          />

          {(type === "expense" || isLinked) && (
            <ComboboxField
              name="supplierId"
              label="Fornecedor"
              options={supplierOptions}
              placeholder="Selecione um fornecedor..."
              searchPlaceholder="Buscar fornecedor..."
              emptyMessage="Nenhum fornecedor encontrado."
              required
            />
          )}

          <SelectField
            name="paymentMethod"
            label="Forma de pagamento"
            options={paymentMethodOptions}
            required
          />

          {/* Arquivos atuais */}
          {(transaction?.attachmentUrl || transaction?.invoiceUrl) && (
            <div className="border-border bg-muted/10 flex flex-col gap-2 rounded-lg border p-3">
              <p className="text-muted-foreground text-xs font-medium">
                Arquivos atuais
              </p>
              {transaction.attachmentUrl && (
                <Link
                  href={transaction.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs hover:underline"
                >
                  Ver comprovante atual
                </Link>
              )}
              {transaction.invoiceUrl && (
                <Link
                  href={transaction.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs hover:underline"
                >
                  Ver nota fiscal atual
                </Link>
              )}
              <p className="text-muted-foreground text-xs">
                Selecione um novo arquivo abaixo para substituir
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FileUploadField
              name="attachmentFile"
              label="Substituir comprovante"
            />
            <FileUploadField
              name="invoiceFile"
              label="Substituir nota fiscal"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="mt-2 w-full"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" /> Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </Form>
    </main>
  );
}
