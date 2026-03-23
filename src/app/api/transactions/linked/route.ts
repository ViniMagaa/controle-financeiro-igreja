import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/schemas/transaction.schema";
import { transactionsService } from "@/services/transactions.service";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const transaction = parsed.data;

    const result = await transactionsService.createLinked(transaction);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
