"use client";

import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type HeaderProps = {
  userName: string;
};

export function Header({ userName }: HeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const { error } = await authService.signOut();

    if (error) {
      toast.error(error);
      return;
    }

    router.push("/login");
  }

  return (
    <header className="border-border flex items-center justify-between border-b px-6 py-3">
      <div>
        <span className="text-sm font-semibold">Controle Financeiro</span>
        <span className="text-muted-foreground hidden text-sm sm:inline">
          {" "}
          — Igreja
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-muted-foreground hidden text-sm sm:inline">
          Olá, {userName}
        </span>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </header>
  );
}
