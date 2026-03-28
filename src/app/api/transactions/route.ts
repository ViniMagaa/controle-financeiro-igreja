import type { PaymentMethod, TransactionType } from "@/generated/prisma/enums";
import { createClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/schemas/transaction.schema";
import { transactionsService } from "@/services/transactions.service";
import { NextResponse } from "next/server";

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    if (!user)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);

    const filters = {
      type: searchParams.get("type") as TransactionType | undefined,
      supplierId: searchParams.get("supplierId") ?? undefined,
      month: searchParams.get("month")
        ? Number(searchParams.get("month"))
        : undefined,
      year: searchParams.get("year")
        ? Number(searchParams.get("year"))
        : undefined,
    };

    const transactions = await transactionsService.list(filters);
    return NextResponse.json(transactions);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (!user)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const parsed = transactionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const transaction = await transactionsService.create({
      ...parsed.data,
      type: parsed.data.type as TransactionType,
      paymentMethod: parsed.data.paymentMethod as PaymentMethod,
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
