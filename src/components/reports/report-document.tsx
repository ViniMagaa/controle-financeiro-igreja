import { ReportHeader } from "@/components/reports/report-header";
import {
  ReportTable,
  TdGreen,
  TdRed,
  TfBlue,
  TfRed,
  ThBlue,
  ThSlate,
  tdStyle,
} from "@/components/reports/report-table";
import { ReportData } from "@/types/report.type";
import { formatCurrency } from "@/utils/format-currency";
import { ReportFooter } from "./report-footer";

type ReportDocumentProps = {
  report: ReportData;
  monthName: string;
  prevMonthName: string;
};

export function ReportDocument({
  report,
  monthName,
  prevMonthName,
}: ReportDocumentProps) {
  return (
    <div className="dark:text-background! border-border overflow-hidden rounded-xl border bg-white shadow-lg print:rounded-none print:shadow-none">
      <ReportHeader badge={`${monthName.toUpperCase()} · ${report.year}`} />

      <div className="flex flex-col gap-4 px-8 py-4">
        {/* Entradas */}
        <ReportTable
          head={
            <tr>
              <ThBlue className="w-36">DATA</ThBlue>
              <ThBlue>ENTRADAS</ThBlue>
              <ThBlue className="w-36" right>
                VALOR
              </ThBlue>
            </tr>
          }
          body={
            <>
              <tr>
                <td style={tdStyle} />
                <td className="font-semibold" style={tdStyle}>
                  Saldo das doações {prevMonthName}
                </td>
                <TdGreen>{formatCurrency(report.previousBalance)}</TdGreen>
              </tr>
              <tr>
                <td className="text-slate-500" style={tdStyle}>
                  1 a {new Date(report.year, report.month, 0).getDate()}{" "}
                  {monthName}
                </td>
                <td className="font-semibold" style={tdStyle}>
                  Total das doações de {monthName}
                </td>
                <TdGreen>{formatCurrency(report.totalIncome)}</TdGreen>
              </tr>
            </>
          }
          foot={
            <tr>
              <TfBlue colSpan={2} className="text-right">
                Total de Entradas
              </TfBlue>
              <TfBlue className="text-right">
                {formatCurrency(report.totalEntradas)}
              </TfBlue>
            </tr>
          }
        />

        {/* Pagamentos por fornecedor */}
        <ReportTable
          head={
            <tr>
              <ThSlate>FORNECEDOR</ThSlate>
              <ThSlate className="w-36" right>
                VALOR
              </ThSlate>
            </tr>
          }
          body={
            <>
              {report.expenseTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="py-px text-center text-sm text-slate-500"
                  >
                    Nenhum pagamento no período
                  </td>
                </tr>
              ) : (
                report.expenseTransactions.map((t) => (
                  <tr key={t.id}>
                    <td className="font-medium uppercase" style={tdStyle}>
                      {t.supplierName}
                    </td>
                    <TdRed>{formatCurrency(t.amount)}</TdRed>
                  </tr>
                ))
              )}
              {report.expenseTransactions.length < 28 &&
                Array.from({
                  length: Math.max(0, 28 - report.expenseTransactions.length),
                }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td className="h-5.5" />
                    <td />
                  </tr>
                ))}
            </>
          }
          foot={
            <>
              <tr>
                <TfRed className="text-right">
                  Total dos gastos com materiais
                </TfRed>
                <TfRed className="text-right">
                  {formatCurrency(report.totalExpense)}
                </TfRed>
              </tr>
              <tr>
                <TfBlue className="text-right">
                  Saldo transportado para próximo mês
                </TfBlue>
                <TfBlue className="text-right">
                  {formatCurrency(report.balance)}
                </TfBlue>
              </tr>
            </>
          }
        />

        <ReportFooter />
      </div>
    </div>
  );
}
