import { createClient } from "@/lib/supabase/server";
import { extractStoragePath } from "@/lib/supabase/storage.client";
import { deleteFiles } from "@/lib/supabase/storage.server";
import { updateTransactionSchema } from "@/schemas/transaction.schema";
import { transactionsService } from "@/services/transactions.service";
import { NextResponse } from "next/server";

export async function GET(
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
    const transaction = await transactionsService.findById(id);

    if (!transaction) {
      return NextResponse.json({ error: "Não encontrada" }, { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
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
    const body = await req.json();
    const parsed = updateTransactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { previousAttachmentUrl, previousInvoiceUrl, ...updateData } =
      parsed.data;

    // Deleta arquivos antigos do Storage se foram substituídos
    const urlsToDelete = [previousAttachmentUrl, previousInvoiceUrl].filter(
      (url): url is string => !!url,
    );

    if (urlsToDelete.length > 0) {
      const paths = urlsToDelete
        .map((url) => extractStoragePath(url, "attachments"))
        .filter((p): p is string => !!p);

      if (paths.length > 0) {
        await supabase.storage.from("attachments").remove(paths);
      }
    }

    const transaction = await transactionsService.update(id, {
      ...updateData,
    });

    return NextResponse.json(transaction);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

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
