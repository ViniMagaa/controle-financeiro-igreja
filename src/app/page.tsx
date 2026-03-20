import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-linear-to-tr from-blue-900 to-blue-600 dark:from-slate-900 dark:to-slate-600">
      <h1 className="dark:text-foreground text-background text-3xl font-bold">
        Controle Financeiro Igreja
      </h1>
      <div className="flex gap-2">
        <Button>
          <Link href="/login">Entrar</Link>
        </Button>
        <Button variant="secondary">
          <Link href="/register">Criar conta</Link>
        </Button>
      </div>
    </div>
  );
}
