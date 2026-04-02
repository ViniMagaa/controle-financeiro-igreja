"use client";

import { ReportDocument } from "@/components/reports/report-document";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ReportData, SupplierReportData } from "@/types/report.type";
import { capitalize } from "@/utils/capitalize-string";
import { Supplier } from "@/generated/prisma/client";
import { Loader2, Printer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { SupplierReportDocument } from "@/components/reports/supplier-report-document";
import { Combobox } from "@/components/ui/combobox";
import { Select } from "@/components/ui/select";

const now = new Date();

const MONTHS = Array.from({ length: 12 }, (_, i) =>
  capitalize(new Date(2000, i).toLocaleString("pt-BR", { month: "long" })),
);

const MONTHS_PREV = [
  "Dezembro",
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
];

const YEARS = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i);

type ReportType = "monthly" | "supplier";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("monthly");

  // Filtros compartilhados
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Filtro exclusivo do relatório por fornecedor
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState("");

  // Dados
  const [monthlyReport, setMonthlyReport] = useState<ReportData | null>(null);
  const [supplierReport, setSupplierReport] =
    useState<SupplierReportData | null>(null);
  const [loading, setLoading] = useState(false);

  // Carrega fornecedores uma vez
  useEffect(() => {
    api.get<Supplier[]>("/api/suppliers").then(({ data, error }) => {
      if (error) {
        toast.error(error);
        return;
      }
      const list = data ?? [];
      setSuppliers(list);
      if (list.length > 0) setSupplierId(list[0].id);
    });
  }, []);

  const fetchMonthly = useCallback(async () => {
    setLoading(true);
    const { data, error } = await api.get<ReportData>("/api/reports/monthly", {
      params: { month: String(month), year: String(year) },
    });
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    setMonthlyReport(data);
    setLoading(false);
  }, [month, year]);

  const fetchSupplier = useCallback(async () => {
    if (!supplierId) return;
    setLoading(true);
    const { data, error } = await api.get<SupplierReportData>(
      "/api/reports/supplier",
      {
        params: { supplierId, month: String(month), year: String(year) },
      },
    );
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    setSupplierReport(data);
    setLoading(false);
  }, [supplierId, month, year]);

  useEffect(() => {
    async function fetch(fn: () => Promise<void>) {
      fn();
    }
    if (reportType === "monthly") fetch(fetchMonthly);
    else fetch(fetchSupplier);
  }, [reportType, fetchMonthly, fetchSupplier]);

  const monthName = MONTHS[month - 1];
  const prevMonthName = MONTHS_PREV[month - 1];

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(2000, i)
      .toLocaleString("pt-BR", { month: "long" })
      .toLocaleUpperCase(),
  }));

  const yearOptions = Array.from({ length: 4 }, (_, i) => {
    const year = now.getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-print, #report-print * { visibility: visible; }
          #report-print { position: absolute; inset: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      <main className="mx-auto w-full max-w-4xl px-6 py-8">
        <div className="no-print mb-6 space-y-4">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Relatório
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Resumo financeiro da construção
              </p>
            </div>
            <Button
              onClick={() => window.print()}
              disabled={loading || (!monthlyReport && !supplierReport)}
            >
              <Printer className="size-4" />
              Imprimir / PDF
            </Button>
          </div>

          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            {/* Seletor de tipo */}
            <div className="flex gap-2">
              {(["monthly", "supplier"] as ReportType[]).map((t) => (
                <Button
                  key={t}
                  variant="outline"
                  onClick={() => setReportType(t)}
                  className={`rounded-md text-sm transition not-sm:flex-1 ${
                    reportType === t &&
                    "bg-primary! text-primary-foreground px-3 py-2"
                  }`}
                >
                  {t === "monthly" ? "Por mês" : "Por fornecedor"}
                </Button>
              ))}
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-1 sm:flex-wrap sm:justify-end">
              {/* Fornecedor — exclusivo do tipo "supplier" */}
              {reportType === "supplier" && (
                <div className="col-span-2 w-full sm:max-w-65">
                  <Combobox
                    options={suppliers.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    value={supplierId}
                    onChange={(value) => setSupplierId(value)}
                    emptyMessage="Nenhum fornecedor encontrado"
                  />
                </div>
              )}

              {/* Mês e ano — presentes nos dois tipos */}
              <Select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                options={monthOptions}
              />

              <Select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                options={yearOptions}
              />
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : (
          <div id="report-print">
            {reportType === "monthly" && monthlyReport && (
              <ReportDocument
                report={monthlyReport}
                monthName={monthName}
                prevMonthName={prevMonthName}
              />
            )}
            {reportType === "supplier" && supplierReport && (
              <SupplierReportDocument report={supplierReport} />
            )}
          </div>
        )}
      </main>
    </>
  );
}
