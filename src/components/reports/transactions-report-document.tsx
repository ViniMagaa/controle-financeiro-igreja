import { ReportHeader } from "@/components/reports/report-header";
import {
  ReportTable,
  TdGreen,
  TdRed,
  TfBlue,
  ThBlue,
  tdStyle,
} from "@/components/reports/report-table";
import { TransactionsReportData } from "@/types/report.type";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { paymentMethodLabels } from "@/utils/payment-method";
import { ReportFooter } from "./report-footer";

type TransactionsReportDocumentProps = {
  report: TransactionsReportData;
  badgeLabel: string | React.ReactNode;
};

export function TransactionsReportDocument({
  report,
  badgeLabel,
}: TransactionsReportDocumentProps) {
  const typeLabel =
    report.filters.type === "income"
      ? "ENTRADAS"
      : report.filters.type === "expense"
        ? "SAÍDAS"
        : null;

  return (
    <div className="dark:text-background! border-border overflow-hidden rounded-xl border bg-white shadow-lg print:rounded-none print:shadow-none">
      <ReportHeader badge={badgeLabel} />

      <div className="flex flex-col gap-4 px-8 py-4">
        <ReportTable
          head={
            <tr>
              <ThBlue className="w-28">DATA</ThBlue>
              <ThBlue>RESPONSÁVEL</ThBlue>
              <ThBlue>FORNECEDOR</ThBlue>
              <ThBlue>PAGAMENTO</ThBlue>
              <ThBlue className="w-36" right>
                {typeLabel ?? "VALOR"}
              </ThBlue>
            </tr>
          }
          body={
            report.transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={report.filters.supplierId ? 4 : 5}
                  className="py-4 text-center text-sm text-slate-500"
                  style={tdStyle}
                >
                  Nenhuma transação encontrada para os filtros selecionados.
                </td>
              </tr>
            ) : (
              report.transactions.map((t) => {
                const Cell = t.type === "expense" ? TdRed : TdGreen;
                return (
                  <tr key={t.id}>
                    <td className="text-slate-500" style={tdStyle}>
                      {formatDate(t.date)}
                    </td>
                    <td className="font-medium" style={tdStyle}>
                      {t.responsibleName}
                    </td>
                    <td className="text-slate-600" style={tdStyle}>
                      {t.supplierName ?? "—"}
                    </td>
                    <td className="text-slate-500" style={tdStyle}>
                      {
                        paymentMethodLabels[
                          t.paymentMethod as keyof typeof paymentMethodLabels
                        ]
                      }
                    </td>
                    <Cell>{formatCurrency(t.amount)}</Cell>
                  </tr>
                );
              })
            )
          }
          foot={
            <tr>
              <TfBlue colSpan={4} className="text-right">
                Total
              </TfBlue>
              <TfBlue className="text-right">
                {formatCurrency(report.total)}
              </TfBlue>
            </tr>
          }
        />

        <ReportFooter />
      </div>
    </div>
  );
}
