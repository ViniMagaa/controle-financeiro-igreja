"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/ui/form-field";
import { api } from "@/lib/api";
import { supplierSchema, SupplierSchema } from "@/schemas/supplier.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Supplier = { id: string; name: string };

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<SupplierSchema>({
    resolver: zodResolver(supplierSchema),
  });

  const fetchSuppliers = useCallback(async () => {
    const { data, error } = await api.get<Supplier[]>("/api/suppliers");
    if (error) {
      toast.error(error);
      return;
    }
    setSuppliers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    api.get<Supplier[]>("/api/suppliers").then(({ data, error }) => {
      if (error) {
        toast.error(error);
        return;
      }
      setSuppliers(data ?? []);
      setLoading(false);
    });
  }, []);

  async function onSubmit(data: SupplierSchema) {
    const { error } = await api.post("/api/suppliers", data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Fornecedor cadastrado!");
    form.reset();
    await fetchSuppliers();
  }

  async function handleDelete(id: string, name: string) {
    toast(`Remover fornecedor "${name}"?`, {
      action: {
        label: "Sim, remover",
        onClick: async () => {
          const { error } = await api.delete(`/api/suppliers/${id}`);
          if (error) {
            toast.error(error);
            return;
          }
          toast.success("Fornecedor removido!");
          await fetchSuppliers();
        },
      },
    });
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Fornecedores</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Empresas e pessoas que recebem pagamentos da obra
        </p>
      </div>

      <Form form={form} onSubmit={onSubmit}>
        <div className="mb-8 flex items-start gap-2">
          <div className="flex-1">
            <FormField
              name="name"
              placeholder="Ex: Depósito Construção Silva"
            />
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" /> Adicionando...
              </>
            ) : (
              "Adicionar"
            )}
          </Button>
        </div>
      </Form>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoaderCircle className="text-muted-foreground size-5 animate-spin" />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border p-8 text-center text-sm">
          Nenhum fornecedor cadastrado ainda.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {suppliers.map((supplier) => (
            <li
              key={supplier.id}
              className="border-border flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <span className="text-sm font-medium">{supplier.name}</span>
              <Button
                variant="destructive"
                onClick={() => handleDelete(supplier.id, supplier.name)}
                className="p-1.5!"
              >
                <Trash className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
