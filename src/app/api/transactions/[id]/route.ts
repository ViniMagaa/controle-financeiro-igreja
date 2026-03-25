import { createClient } from "@/lib/supabase/server";
import { deleteFiles } from "@/lib/supabase/storage.server";
import { transactionsService } from "@/services/transactions.service";
import { NextResponse } from "next/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Busca URLs antes de deletar o registro
    const urls = await transactionsService.getFileUrls(id);

    // Deleta arquivos do Storage — falha silenciosa com allSettled
    if (urls.length > 0) {
      await deleteFiles(urls, "attachments");
    }

    // Deleta do banco
    await transactionsService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
