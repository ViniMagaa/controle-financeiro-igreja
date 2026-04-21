"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-linear-to-tr from-blue-900 to-blue-600 dark:from-slate-900 dark:to-slate-600">
      <div className="border-border bg-background flex min-h-screen w-full items-center justify-center border-l px-4 md:ml-auto md:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Recurso indisponível
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              No momento não é possível criar uma conta
            </p>
          </div>

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
