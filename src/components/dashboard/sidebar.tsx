"use client";

import { authService } from "@/services/auth.service";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Church,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  Truck,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { href: "/suppliers", label: "Fornecedores", icon: Truck },
  { href: "/reports", label: "Relatórios", icon: FileText },
];

type SidebarProps = {
  userName: string;
};

export function Sidebar({ userName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function handleSignOut() {
    const { error } = await authService.signOut();
    if (error) {
      toast.error(error);
      return;
    }
    router.push("/login");
  }

  function handleToggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return (
    <aside
      className={`border-border bg-background relative z-10 flex h-screen shrink-0 flex-col border-r transition-all duration-300 ease-in-out max-sm:fixed ${collapsed ? "w-15" : "w-55"}`}
    >
      {/* Logo */}
      <div
        className={`border-border flex items-center gap-2.5 overflow-hidden border-b px-4 py-4 ${collapsed ? "justify-center px-0" : ""}`}
      >
        <div className="bg-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Church className="text-primary-foreground size-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden leading-tight">
            <span className="truncate text-sm font-semibold">
              Igreja Apostólica
            </span>
            <span className="text-muted-foreground truncate text-xs">
              Controle Financeiro
            </span>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${collapsed ? "justify-center px-0 py-2.5" : ""} ${
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-border flex flex-col gap-2 border-t p-2">
        {/* Logout */}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={`hover:text-destructive! w-full text-sm font-normal ${collapsed ? "justify-center px-0 py-2.5" : "justify-start"}`}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span className="truncate">Sair</span>}
        </Button>

        {/* Toggle de tema */}
        <Button
          variant="ghost"
          onClick={handleToggleTheme}
          className={`w-full text-sm font-normal ${collapsed ? "justify-center px-0 py-2.5" : "justify-start"}`}
        >
          <Sun className="size-4 shrink-0 not-dark:hidden" />
          <Moon className="size-4 shrink-0 dark:hidden" />
          {!collapsed && (
            <span className="truncate">
              Modo <span className="dark:hidden">escuro</span>
              <span className="not-dark:hidden">claro</span>
            </span>
          )}
        </Button>

        {/* Nome do usuário */}
        {!collapsed && (
          <div className="mt-1 px-3 py-2">
            <p className="text-muted-foreground truncate text-xs">
              Olá,{" "}
              <span className="text-foreground font-medium">{userName}</span>
            </p>
          </div>
        )}
      </div>

      {/* Botão de colapsar */}
      <Button
        variant="outline"
        onClick={() => setCollapsed(!collapsed)}
        className="bg-background! absolute top-13 -right-4 z-10 p-2!"
        title={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        {collapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </Button>
    </aside>
  );
}
