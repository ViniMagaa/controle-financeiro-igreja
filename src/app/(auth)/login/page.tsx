"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormField } from "@/components/ui/form-field";
import { loginSchema, LoginSchema } from "@/schemas/auth/login.schema";
import { authService } from "@/services/auth.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginSchema) {
    const { error } = await authService.signIn(data.email, data.password);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Bem vindo!");
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-linear-to-tr from-blue-900 to-blue-600 dark:from-slate-900 dark:to-slate-600">
      <div className="border-border bg-background flex min-h-screen w-full items-center justify-center border-r px-4 md:mr-auto md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Acesse o controle financeiro da igreja
            </p>
          </div>
          <Form form={form} onSubmit={onSubmit}>
            <div className="flex flex-col gap-3">
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
                    <LoaderCircle className="size-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </div>
          </Form>

          <p className="text-muted-foreground mt-4 flex items-center gap-2 text-center text-sm">
            Não tem uma conta?
            <Button
              variant="link"
              className="p-0!"
              onClick={() => router.push("/register")}
            >
              Criar conta
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
