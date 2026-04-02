import { ReportHeader } from "@/components/reports/report-header";
import {
  ReportTable,
  TdRed,
  TfRed,
  ThSlate,
  tdStyle,
} from "@/components/reports/report-table";
import { SupplierReportData } from "@/types/report.type";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { ReportFooter } from "./report-footer";

type SupplierReportDocumentProps = {
  report: SupplierReportData;
};

export function SupplierReportDocument({
  report,
}: SupplierReportDocumentProps) {
  return (
    <div className="dark:text-background! border-border overflow-hidden rounded-xl border bg-white shadow-lg print:rounded-none print:shadow-none">
      <ReportHeader
        badge={
          <>
            Pagamentos efetuados para <br /> {report.supplierName.toUpperCase()}
          </>
        }
      />

      <div className="flex flex-col gap-4 px-8 py-4">
        <ReportTable
          head={
            <tr>
              <ThSlate className="w-32">DATA</ThSlate>
              <ThSlate>RESPONSÁVEL</ThSlate>
              <ThSlate className="w-36" right>
                VALOR
              </ThSlate>
            </tr>
          }
          body={
            report.transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-4 text-center text-sm text-slate-500"
                  style={tdStyle}
                >
                  Nenhum pagamento registrado para este fornecedor
                </td>
              </tr>
            ) : (
              report.transactions.map((t) => (
                <tr key={t.id}>
                  <td className="text-slate-500" style={tdStyle}>
                    {formatDate(t.date)}
                  </td>
                  <td className="font-medium" style={tdStyle}>
                    {t.responsibleName}
                  </td>
                  <TdRed>{formatCurrency(t.amount)}</TdRed>
                </tr>
              ))
            )
          }
          foot={
            <tr>
              <TfRed colSpan={2} className="text-right">
                Total
              </TfRed>
              <TfRed className="text-right">
                {formatCurrency(report.total)}
              </TfRed>
            </tr>
          }
        />

        <ReportFooter />
      </div>
    </div>
  );
}
