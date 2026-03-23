import { suppliersService } from "@/services/suppliers.service";
import { supplierSchema } from "@/schemas/supplier.schema";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const suppliers = await suppliersService.list();
    return NextResponse.json(suppliers);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const parsed = supplierSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
    }

    const supplier = await suppliersService.create(parsed.data.name);
    return NextResponse.json(supplier, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
