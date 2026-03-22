"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/ui/form-field";
import { Category } from "@/generated/prisma/client";
import { api } from "@/lib/api";
import { categorySchema, CategorySchema } from "@/schemas/category.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
  });

  const fetchCategories = useCallback(async () => {
    const { data, error } = await api.get<Category[]>("/api/categories");
    if (error) {
      toast.error(error);
      return;
    }
    setCategories(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    async function fetch() {
      fetchCategories();
    }
    fetch();
  }, [fetchCategories]);

  async function onSubmit(data: CategorySchema) {
    const { error } = await api.post("/api/categories", data);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Categoria criada!");
    form.reset();
    fetchCategories();
  }

  async function handleDelete(id: string, name: string) {
    toast(`Remover categoria "${name}"?`, {
      action: {
        label: "Sim, remover",
        onClick: async () => {
          const { error } = await api.delete(`/api/categories/${id}`);
          if (error) {
            toast.error(error);
            return;
          }
          toast.success("Categoria removida!");
          fetchCategories();
        },
      },
    });
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Centros de custo da obra (elétrica, alvenaria, acabamento...)
        </p>
      </div>

      {/* Formulário de nova categoria */}
      <Form form={form} onSubmit={onSubmit}>
        <div className="mb-8 flex items-start gap-2">
          <div className="flex-1">
            <FormField name="name" label="" placeholder="Ex: Elétrica" />
          </div>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="h-11"
          >
            {form.formState.isSubmitting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              "Adicionar"
            )}
          </Button>
        </div>
      </Form>

      {/* Lista de categorias */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoaderCircle className="text-muted-foreground size-5 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border p-8 text-center text-sm">
          Nenhuma categoria cadastrada ainda.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="border-border flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <span className="text-sm font-medium">{category.name}</span>
              <Button
                variant="destructive"
                onClick={() => handleDelete(category.id, category.name)}
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
