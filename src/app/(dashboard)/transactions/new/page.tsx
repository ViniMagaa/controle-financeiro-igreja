"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import {
  transactionFormSchema,
  TransactionFormSchema,
} from "@/schemas/transaction.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Category = { id: string; name: string };

const paymentMethodLabels = {
  pix: "PIX",
  cash: "Dinheiro",
  card: "Cartão",
  boleto: "Boleto",
  transfer: "Transferência",
};

export default function NewTransactionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  const form = useForm<TransactionFormSchema>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const {
    register,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const type = watch("type");

  useEffect(() => {
    api.get<Category[]>("/api/categories").then(({ data, error }) => {
      if (error) {
        toast.error(error);
        return;
      }
      setCategories(data ?? []);
    });
  }, []);

  async function onSubmit(data: TransactionFormSchema) {
    const { error } = await api.post("/api/transactions", data);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Transação registrada!");
    router.push("/transactions");
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
          Nova transação
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Registre uma entrada ou saída financeira
        </p>
      </div>

      <Form form={form} onSubmit={onSubmit}>
        <div className="flex flex-col gap-4">
          {/* Tipo: entrada ou saída */}
          <div className="flex flex-col gap-1.5">
            <Label>Tipo</Label>
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
                  }`}
                >
                  <input
                    type="radio"
                    value={t}
                    className="sr-only"
                    {...register("type")}
                  />
                  {t === "income" ? "Entrada (doação)" : "Saída (pagamento)"}
                </label>
              ))}
            </div>
            <FormError message={errors.type?.message} />
          </div>

          <FormField
            name="description"
            label="Descrição do material ou serviço"
            placeholder="Ex: Cimento 50kg, Mão de obra elétrica..."
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="amount"
              label="Valor (R$)"
              placeholder="Ex: 850,00"
            />
            <FormField name="date" label="Data" type="date" />
          </div>

          <FormField
            name="responsibleName"
            label="Nome do responsável"
            placeholder="Quem realizou o pagamento ou doação"
          />

          {/* Fornecedor — só aparece em saídas */}
          {type === "expense" && (
            <FormField
              name="supplierName"
              label="Nome do fornecedor"
              placeholder="Ex: Depósito Construção Silva"
            />
          )}

          {/* Forma de pagamento */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="paymentMethod">Forma de pagamento</Label>
            <select
              id="paymentMethod"
              className="border-border bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              {...register("paymentMethod")}
            >
              <option value="">Selecione...</option>
              {Object.entries(paymentMethodLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <FormError message={errors.paymentMethod?.message} />
          </div>

          {/* Categoria */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoryId">Categoria</Label>
            <select
              id="categoryId"
              className="border-border bg-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              {...register("categoryId")}
            >
              <option value="">Selecione...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <FormError message={errors.categoryId?.message} />
            {categories.length === 0 && (
              <p className="text-muted-foreground text-xs">
                Nenhuma categoria cadastrada.{" "}
                <Link
                  href="/categories"
                  className="text-primary hover:underline"
                >
                  Criar categoria
                </Link>
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" /> Salvando...
              </>
            ) : (
              "Registrar transação"
            )}
          </Button>
        </div>
      </Form>
    </main>
  );
}
