import { ReportData } from "@/types/report.type";
import { formatCurrency } from "@/utils/format-currency";
import Image from "next/image";

type ReportDocumentProps = {
  report: ReportData;
  monthName: string;
  prevMonthName: string;
};

const thStyle: React.CSSProperties = {
  padding: "2px 14px",
  fontWeight: 700,
  letterSpacing: "0.5px",
  fontSize: "12px",
};

const tdStyle: React.CSSProperties = {
  padding: "2px 14px",
  borderBottom: "1px solid #f1f5f9",
  fontSize: "12px",
};

export function ReportDocument({
  report,
  monthName,
  prevMonthName,
}: ReportDocumentProps) {
  return (
    <div className="dark:text-background! border-border overflow-hidden rounded-xl border bg-white shadow-lg print:rounded-none print:shadow-none">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-8 bg-linear-to-t from-blue-300 to-blue-100 px-8 py-6">
        {/* Logo esquerda */}
        <Image
          src="/logo-igreja.png"
          alt="Preview"
          width={100}
          height={100}
          className="w-full max-w-48"
        />

        {/* Título central */}
        <div className="flex flex-1 flex-col items-center">
          <div className="text-sm font-semibold tracking-widest uppercase">
            Relatórios Construção
          </div>
          <div className="text-5xl font-bold text-blue-900">AMERICANA</div>
          <div className="mt-2 rounded-full bg-blue-700 px-4 py-1 text-sm font-bold text-white">
            {monthName.toUpperCase()} · {report.year}
          </div>
        </div>

        {/* Logo direita */}
        <Image
          src="/logo-hora-milagrosa.png"
          alt="Preview"
          width={100}
          height={100}
          className="w-full max-w-48"
        />
      </div>

      <div className="flex flex-col gap-4 px-8 py-4">
        {/* Tabela de entradas */}
        <div>
          <table className="border-border w-full border-separate border-spacing-0 overflow-hidden rounded-lg border">
            <thead>
              <tr>
                <th
                  className="w-36 bg-blue-950 text-left text-white"
                  style={thStyle}
                >
                  DATA
                </th>
                <th
                  className="bg-blue-950 text-left text-white"
                  style={thStyle}
                >
                  ENTRADAS
                </th>
                <th
                  className="w-36 bg-blue-950 text-right text-white"
                  style={thStyle}
                >
                  VALOR
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Saldo mês anterior */}
              <tr>
                <td style={tdStyle}></td>
                <td className="font-semibold" style={tdStyle}>
                  Saldo das doações {prevMonthName}
                </td>
                <td
                  className="text-right font-semibold text-[#008000]"
                  style={tdStyle}
                >
                  {formatCurrency(report.previousBalance)}
                </td>
              </tr>

              {/* Doações do mês */}
              <tr>
                <td className="text-slate-500" style={tdStyle}>
                  1 a {new Date(report.year, report.month, 0).getDate()}{" "}
                  {monthName}
                </td>
                <td className="font-semibold" style={tdStyle}>
                  Total das doações de {monthName}
                </td>
                <td
                  className="text-right font-semibold text-[#008000]"
                  style={tdStyle}
                >
                  {formatCurrency(report.totalIncome)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={2}
                  className="w-36 bg-blue-100 text-right font-bold text-blue-900"
                  style={tdStyle}
                >
                  Total de Entradas
                </td>
                <td
                  className="w-36 bg-blue-100 text-right font-bold text-blue-900"
                  style={tdStyle}
                >
                  {formatCurrency(report.totalEntradas)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Tabela de pagamentos */}
        <div>
          <table className="border-border w-full border-separate border-spacing-0 overflow-hidden rounded-lg border">
            <thead>
              <tr>
                <th
                  className="bg-slate-700 text-left text-white"
                  style={thStyle}
                >
                  FORNECEDOR
                </th>
                <th
                  className="w-36 bg-slate-700 text-right text-white"
                  style={thStyle}
                >
                  VALOR
                </th>
              </tr>
            </thead>
            <tbody>
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
                    <td
                      className="text-right font-semibold text-[#990000]"
                      style={tdStyle}
                    >
                      {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))
              )}

              {/* Linhas vazias */}
              {report.expenseTransactions.length < 28 &&
                [
                  ...Array(Math.max(0, 28 - report.expenseTransactions.length)),
                ].map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td className="h-5.5"></td>
                    <td></td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr>
                <td
                  className="bg-[#cc000022] text-right font-bold text-[#990000]"
                  style={tdStyle}
                >
                  Total dos gastos com materiais
                </td>
                <td
                  className="bg-[#cc000022] text-right font-bold text-[#990000]"
                  style={tdStyle}
                >
                  {formatCurrency(report.totalExpense)}
                </td>
              </tr>
              <tr>
                <td
                  className="bg-blue-100 text-right font-bold text-blue-900"
                  style={tdStyle}
                >
                  Saldo transportado para próximo mês
                </td>
                <td
                  className="bg-blue-100 text-right font-bold text-blue-900"
                  style={tdStyle}
                >
                  {formatCurrency(report.balance)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-center gap-4">
          <p className="text-sm font-bold">Maria Odete Magalhães dos Santos</p>
          <p className="text-[10px]">(19) 98171-3557</p>
        </div>
      </div>
    </div>
  );
}
