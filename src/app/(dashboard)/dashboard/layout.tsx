import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/dashboard/header";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const userName = user.user_metadata?.displayName ?? user.email ?? "Usuário";

  return (
    <div className="flex min-h-screen flex-col">
      <Header userName={userName} />
      {children}
    </div>
  );
}
