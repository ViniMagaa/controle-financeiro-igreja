"use client";

import { authService } from "@/services/auth.service";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Church,
  LayoutDashboard,
  LogOut,
  Tag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { href: "/categories", label: "Categorias", icon: Tag },
  { href: "/suppliers", label: "Fornecedores", icon: Truck },
];

type SidebarProps = {
  userName: string;
};

export function Sidebar({ userName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
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
    <aside
      className={`border-border bg-background relative flex h-screen shrink-0 flex-col border-r transition-all duration-300 ease-in-out ${collapsed ? "w-15" : "w-55"} `}
    >
      {/* Logo */}
      <div
        className={`border-border flex items-center gap-2.5 overflow-hidden border-b px-4 py-4 ${collapsed ? "justify-center px-0" : ""} `}
      >
        <div className="bg-primary flex size-7 shrink-0 items-center justify-center rounded-lg">
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
              } `}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer: usuário + logout */}
      <div className={`border-border border-t p-2 ${collapsed ? "" : ""}`}>
        <button
          onClick={handleSignOut}
          title={collapsed ? "Sair" : undefined}
          className={`text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${collapsed ? "justify-center px-0 py-2.5" : ""} `}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span className="truncate">Sair</span>}
        </button>

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
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="bg-background border-border text-muted-foreground hover:text-foreground absolute top-13 -right-3 z-10 flex size-6 items-center justify-center rounded-full border shadow-sm transition-colors"
        title={collapsed ? "Expandir menu" : "Recolher menu"}
      >
        {collapsed ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </button>
    </aside>
  );
}
