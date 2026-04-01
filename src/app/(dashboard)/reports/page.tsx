"use client";

import { ReportDocument } from "@/components/reports/report-document";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ReportData } from "@/types/report.type";
import { capitalize } from "@/utils/capitalize-string";
import { Loader2, Printer } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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

const YEARS = Array.from({ length: 4 }, (_, i) => {
  return now.getFullYear() - i;
});

export default function ReportsPage() {
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    const { data, error } = await api.get<ReportData>("/api/reports/monthly", {
      params: { month: String(month), year: String(year) },
    });
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    setReport(data);
    setLoading(false);
  }, [month, year]);

  useEffect(() => {
    async function fetch() {
      fetchReport();
    }
    fetch();
  }, [fetchReport]);

  function handlePrint() {
    window.print();
  }

  const monthName = MONTHS[month - 1];
  const prevMonthName = MONTHS_PREV[month - 1];

  return (
    <>
      {/* CSS de impressão — só aparece ao imprimir */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-print, #report-print * { visibility: visible; }
          #report-print {
            position: absolute;
            inset: 0;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <main className="mx-auto w-full max-w-4xl px-6 py-8">
        {/* Controles — não aparecem na impressão */}
        <div className="no-print mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Relatório mensal
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Resumo financeiro da construção
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border-border bg-background focus:ring-ring rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2"
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border-border bg-background focus:ring-ring rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <Button onClick={handlePrint} disabled={!report || loading}>
              <Printer className="size-4" />
              Imprimir / PDF
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="text-muted-foreground size-5 animate-spin" />
          </div>
        ) : report ? (
          <div id="report-print" ref={printRef}>
            <ReportDocument
              report={report}
              monthName={monthName}
              prevMonthName={prevMonthName}
            />
          </div>
        ) : null}
      </main>
    </>
  );
}
