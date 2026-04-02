import { Sidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={userName} />
      <div className="flex-1 overflow-y-auto max-sm:pl-15">{children}</div>
    </div>
  );
}
