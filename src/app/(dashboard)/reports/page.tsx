"use client";

import { AnnualReportDocument } from "@/components/reports/annual-report-document";
import { ReportDocument } from "@/components/reports/report-document";
import { SupplierReportDocument } from "@/components/reports/supplier-report-document";
import { TransactionsReportDocument } from "@/components/reports/transactions-report-document";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Supplier } from "@/generated/prisma/client";
import { api } from "@/lib/api";
import {
  AnnualReportData,
  ReportData,
  SupplierReportData,
  TransactionsReportData,
} from "@/types/report.type";
import { capitalize } from "@/utils/capitalize-string";
import { paymentMethodOptions as paymentMethod } from "@/utils/payment-method";
import { Loader2, Printer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

// ─── Constantes ────────────────────────────────────────────────────────────────

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

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: (i + 1).toString(),
  label: new Date(2000, i)
    .toLocaleString("pt-BR", { month: "long" })
    .toLocaleUpperCase(),
}));

const yearOptions = YEARS.map((y) => ({
  value: y.toString(),
  label: y.toString(),
}));

const typeOptions = [
  { value: "", label: "Todos os tipos" },
  { value: "income", label: "Entradas" },
  { value: "expense", label: "Saídas" },
];

const paymentMethodOptions = [
  {
    value: "",
    label: "Todos os pagamentos",
  },
].concat(paymentMethod);

type ReportType = "monthly" | "supplier" | "annual" | "transactions";

const REPORT_LABELS: Record<ReportType, string> = {
  monthly: "Mensal",
  supplier: "Fornecedor",
  annual: "Anual",
  transactions: "Transações",
};

// ─── Página ────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("monthly");

  // Filtros compartilhados (mês/ano)
  const [month, setMonth] = useState((now.getMonth() + 1).toString());
  const [year, setYear] = useState(now.getFullYear().toString());

  // Filtros do relatório por fornecedor / transações
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Dados
  const [monthlyReport, setMonthlyReport] = useState<ReportData | null>(null);
  const [supplierReport, setSupplierReport] =
    useState<SupplierReportData | null>(null);
  const [annualReport, setAnnualReport] = useState<AnnualReportData | null>(
    null,
  );
  const [transactionsReport, setTransactionsReport] =
    useState<TransactionsReportData | null>(null);
  const [loading, setLoading] = useState(false);

  // Carrega fornecedores uma vez
  useEffect(() => {
    api.get<Supplier[]>("/api/suppliers").then(({ data, error }) => {
      if (error) {
        toast.error(error);
        return;
      }
      setSuppliers(data ?? []);
    });
  }, []);

  const fetchMonthly = useCallback(async () => {
    if (!month || !year) return;
    setLoading(true);
    const { data, error } = await api.get<ReportData>("/api/reports/monthly", {
      params: { month, year },
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
    const params: Record<string, string> = { supplierId };
    if (month) params.month = month;
    if (year) params.year = year;
    const { data, error } = await api.get<SupplierReportData>(
      "/api/reports/supplier",
      { params },
    );
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    setSupplierReport(data);
    setLoading(false);
  }, [supplierId, month, year]);

  const fetchAnnual = useCallback(async () => {
    if (!year) return;
    setLoading(true);
    const { data, error } = await api.get<AnnualReportData>(
      "/api/reports/annual",
      {
        params: { year },
      },
    );
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    setAnnualReport(data);
    setLoading(false);
  }, [year]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (transactionType) params.type = transactionType;
    if (supplierId) params.supplierId = supplierId;
    if (responsibleName) params.responsibleName = responsibleName;
    if (paymentMethod) params.paymentMethod = paymentMethod;
    if (month) params.month = month;
    if (year) params.year = year;
    const { data, error } = await api.get<TransactionsReportData>(
      "/api/reports/transactions",
      { params },
    );
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    setTransactionsReport(data);
    setLoading(false);
  }, [
    transactionType,
    supplierId,
    responsibleName,
    paymentMethod,
    month,
    year,
  ]);

  useEffect(() => {
    async function fetch(fn: () => Promise<void>) {
      fn();
    }
    if (reportType === "monthly") fetch(fetchMonthly);
    else if (reportType === "supplier") fetch(fetchSupplier);
    else if (reportType === "annual") fetch(fetchAnnual);
    else fetch(fetchTransactions);
  }, [reportType, fetchMonthly, fetchSupplier, fetchAnnual, fetchTransactions]);

  // Badge do cabeçalho do relatório de transações
  function buildTransactionsBadge() {
    const parts: string[] = [];
    if (transactionType === "income") parts.push("Entradas");
    else if (transactionType === "expense") parts.push("Saídas");
    else parts.push("Transações");
    if (month && year) parts.push(`${MONTHS[Number(month) - 1]} ${year}`);
    else if (month) parts.push(MONTHS[Number(month) - 1]);
    else if (year) parts.push(year);
    if (supplierId) {
      const supplier = suppliers.find((s) => s.id === supplierId);
      return (
        <p>
          {parts.join(" · ")} <br />
          {supplier?.name?.toLocaleUpperCase() || "FORNECEDOR"}
        </p>
      );
    }
    return parts.join(" · ");
  }

  const hasReport =
    !!monthlyReport ||
    !!supplierReport ||
    !!annualReport ||
    !!transactionsReport;

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
              disabled={loading || !hasReport}
            >
              <Printer className="size-4" />
              Imprimir / PDF
            </Button>
          </div>

          <div
            className={`flex flex-row flex-wrap justify-between gap-2 ${["supplier", "transactions"].includes(reportType) ? "flex-col!" : ""}`}
          >
            {/* Seletor de tipo */}
            <div className="flex flex-wrap gap-2">
              {(Object.keys(REPORT_LABELS) as ReportType[]).map((t) => (
                <Button
                  key={t}
                  variant="outline"
                  onClick={() => setReportType(t)}
                  className={`rounded-md px-3 py-2 text-sm transition not-sm:flex-1 ${
                    reportType === t && "bg-primary! text-primary-foreground"
                  }`}
                >
                  {REPORT_LABELS[t]}
                </Button>
              ))}
            </div>

            {/* Filtros */}
            <div
              className={`flex gap-2 ${["supplier", "transactions"].includes(reportType) ? "grid grid-cols-1 sm:grid-cols-3" : ""}`}
            >
              {/* Tipo de transação — exclusivo do relatório de transações */}
              {reportType === "transactions" && (
                <Select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  options={typeOptions}
                />
              )}

              {/* Mês — oculto no anual */}
              {reportType !== "annual" && (
                <Select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  options={monthOptions}
                />
              )}

              {/* Ano — sempre presente */}
              <Select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                options={yearOptions}
              />

              {/* Fornecedor — supplier e transactions */}
              {(reportType === "supplier" || reportType === "transactions") && (
                <Combobox
                  options={[
                    ...(reportType === "transactions"
                      ? [{ value: "", label: "Todos os fornecedores" }]
                      : []),
                    ...suppliers.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  value={supplierId}
                  onChange={setSupplierId}
                  emptyMessage="Nenhum fornecedor encontrado"
                />
              )}

              {/* Responsável — exclusivo do relatório de transações */}
              {reportType === "transactions" && (
                <Input
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  placeholder="Nome do responsável"
                />
              )}

              {/* Forma de pagamento — exclusivo do relatório de transações */}
              {reportType === "transactions" && (
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  options={paymentMethodOptions}
                />
              )}
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
            {reportType === "monthly" && month && monthlyReport && (
              <ReportDocument
                report={monthlyReport}
                monthName={MONTHS[Number(month) - 1]}
                prevMonthName={MONTHS_PREV[Number(month) - 1]}
              />
            )}
            {reportType === "supplier" && supplierReport && (
              <SupplierReportDocument report={supplierReport} />
            )}
            {reportType === "annual" && annualReport && (
              <AnnualReportDocument report={annualReport} />
            )}
            {reportType === "transactions" && transactionsReport && (
              <TransactionsReportDocument
                report={transactionsReport}
                badgeLabel={buildTransactionsBadge()}
              />
            )}
          </div>
        )}
      </main>
    </>
  );
}
