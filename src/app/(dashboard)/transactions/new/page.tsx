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
import { Supplier } from "@/generated/prisma/client";
import { api } from "@/lib/api";
import { uploadFile } from "@/lib/supabase/storage.client";
import {
  transactionFormSchema,
  TransactionFormSchema,
} from "@/schemas/transaction.schema";
import { paymentMethodOptions } from "@/utils/payment-method";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function NewTransactionPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const form = useForm<TransactionFormSchema>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      isDirectPayment: false,
    },
  });

  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const type = watch("type");
  const isDirectPayment = watch("isDirectPayment") ?? false;

  useEffect(() => {
    api.get<Supplier[]>("/api/suppliers").then(({ data, error }) => {
      if (error) {
        toast.error(error);
        return;
      }
      setSuppliers(data ?? []);
    });
  }, []);

  // Ao ativar pagamento direto, força type para expense
  function handleDirectPaymentToggle(checked: boolean) {
    setValue("isDirectPayment", checked);
    if (checked) setValue("type", "expense");
  }

  async function onSubmit(data: TransactionFormSchema) {
    // Faz upload dos arquivos antes de salvar
    let attachmentUrl: string | undefined;
    let invoiceUrl: string | undefined;

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
      attachmentUrl = url ?? undefined;
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
      invoiceUrl = url ?? undefined;
    }

    const payload = {
      ...data,
      attachmentUrl,
      invoiceUrl,
      supplierId: data.type === "expense" ? data.supplierId : undefined,
      attachmentFile: undefined,
      invoiceFile: undefined,
    };

    if (data.isDirectPayment) {
      const { error } = await api.post("/api/transactions/linked", payload);
      if (error) {
        toast.error(error);
        return;
      }
    } else {
      const { error } = await api.post("/api/transactions", payload);
      if (error) {
        toast.error(error);
        return;
      }
    }

    toast.success(
      isDirectPayment ? "Transações registradas!" : "Transação registrada!",
    );
    router.push("/transactions");
  }

  const supplierOptions = suppliers.map((s) => ({
    value: s.id,
    label: s.name,
  }));

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
          Nova transação
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Registre uma entrada ou saída financeira
        </p>
      </div>

      <Form form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          {/* Toggle pagamento direto */}
          <label
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
              isDirectPayment
                ? "border-primary/50 bg-primary/5"
                : "border-border hover:bg-muted/40"
            } `}
          >
            <input
              type="checkbox"
              className="accent-primary mt-0.5"
              checked={isDirectPayment}
              onChange={(e) => handleDirectPaymentToggle(e.target.checked)}
            />
            <div>
              <p className="text-sm font-medium">
                Pagamento direto ao fornecedor
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Registra entrada e saída juntas quando alguém paga diretamente
                ao fornecedor.
              </p>
            </div>
          </label>

          {/* Tipo — oculto quando pagamento direto */}
          {!isDirectPayment && (
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

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <CurrencyField name="amount" label="Valor" required />
            <FormField name="date" label="Data" type="date" required />
          </div>

          {/* Responsável */}
          <FormField
            name="responsibleName"
            label="Nome do responsável"
            placeholder="Quem realizou o pagamento ou doação"
            required
          />

          {/* Forma de pagamento */}
          <SelectField
            name="paymentMethod"
            label="Forma de pagamento"
            options={paymentMethodOptions}
            required
          />

          {/* Fornecedor — saída ou pagamento direto */}
          {(type === "expense" || isDirectPayment) && (
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

          {/* Descrição */}
          <FormField
            name="description"
            label="Descrição do material ou serviço"
            placeholder="Ex: Cimento 50kg, Mão de obra elétrica..."
          />

          {/* Comprovante e Nota Fiscal */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FileUploadField name="attachmentFile" label="Comprovante" />
            <FileUploadField name="invoiceFile" label="Nota fiscal" />
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" /> Salvando...
              </>
            ) : isDirectPayment ? (
              "Registrar entrada e saída"
            ) : (
              "Registrar transação"
            )}
          </Button>
        </div>
      </Form>
    </main>
  );
}
