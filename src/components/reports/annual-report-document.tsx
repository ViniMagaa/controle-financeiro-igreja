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
import { AnnualReportData } from "@/types/report.type";
import { formatCurrency } from "@/utils/format-currency";
import { ReportFooter } from "./report-footer";

type AnnualReportDocumentProps = {
  report: AnnualReportData;
};

const MONTHS = [
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
  "Dezembro",
];

export function AnnualReportDocument({ report }: AnnualReportDocumentProps) {
  return (
    <div className="dark:text-background! border-border overflow-hidden rounded-xl border bg-white shadow-lg print:rounded-none print:shadow-none">
      <ReportHeader badge={`ANUAL ${report.year}`} />

      <div className="flex flex-col gap-4 px-8 py-4">
        {/* Tabela de entradas por mês */}
        <ReportTable
          head={
            <tr>
              <ThBlue>ENTRADAS</ThBlue>
              <ThBlue className="w-40" right>
                VALOR
              </ThBlue>
            </tr>
          }
          body={
            <>
              {/* Saldo do ano anterior */}
              <tr>
                <td className="font-semibold" style={tdStyle}>
                  Saldo das doações {report.year - 1}
                </td>
                <TdGreen>{formatCurrency(report.previousYearBalance)}</TdGreen>
              </tr>

              {/* Doações mês a mês */}
              {report.months.map((m) => (
                <tr key={m.month}>
                  <td style={tdStyle}>
                    Total das doações em {MONTHS[m.month - 1]}
                  </td>
                  <TdGreen>{formatCurrency(m.income)}</TdGreen>
                </tr>
              ))}
            </>
          }
          foot={
            <tr>
              <TfBlue className="text-right">Total das doações</TfBlue>
              <TfBlue className="text-right">
                {formatCurrency(report.totalIncome)}
              </TfBlue>
            </tr>
          }
        />

        {/* Tabela de saídas por mês */}
        <ReportTable
          head={
            <tr>
              <ThSlate>SAÍDAS</ThSlate>
              <ThSlate className="w-40" right>
                VALOR
              </ThSlate>
            </tr>
          }
          body={report.months.map((m) => (
            <tr key={m.month}>
              <td style={tdStyle}>
                Total dos pagamentos efetuados em {MONTHS[m.month - 1]}
              </td>
              <TdRed>{formatCurrency(m.expense)}</TdRed>
            </tr>
          ))}
          foot={
            <>
              <tr>
                <TfRed className="text-right">Total dos pagamentos</TfRed>
                <TfRed className="text-right">
                  {formatCurrency(report.totalExpense)}
                </TfRed>
              </tr>
              <tr>
                <TfBlue className="font-bold">
                  31/12/{report.year} — Saldo das doações {report.year}
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
