"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/ui/form-field";
import { registerSchema, RegisterSchema } from "@/schemas/auth/register.schema";
import { authService } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterSchema) {
    const { error } = await authService.signUp(
      data.email,
      data.password,
      data.name,
    );

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Conta criada!");
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-linear-to-tr from-blue-900 to-blue-600 dark:from-slate-900 dark:to-slate-600">
      <div className="border-border bg-background flex min-h-screen w-full items-center justify-center border-l px-4 md:ml-auto md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Criar conta
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Preencha os dados para acessar o sistema
            </p>
          </div>
          <Form form={form} onSubmit={onSubmit}>
            <div className="flex flex-col gap-3">
              <FormField
                name="name"
                label="Nome"
                placeholder="Digite seu nome"
              />

              <FormField
                name="email"
                label="Email"
                type="email"
                placeholder="Digite seu email"
              />

              <FormField
                name="password"
                label="Senha"
                type="password"
                placeholder="Digite sua senha"
              />

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </div>
          </Form>

          <p className="text-muted-foreground mt-4 flex items-center gap-2 text-center text-sm">
            Já tem uma conta?
            <Button
              variant="link"
              className="p-0!"
              onClick={() => router.push("/login")}
            >
              Entrar
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
