import { SupplierReportData } from "@/types/report.type";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import Image from "next/image";

type SupplierReportDocumentProps = {
  report: SupplierReportData;
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

export function SupplierReportDocument({
  report,
}: SupplierReportDocumentProps) {
  return (
    <div className="dark:text-background! border-border overflow-hidden rounded-xl border bg-white shadow-lg print:rounded-none print:shadow-none">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-8 bg-linear-to-t from-blue-300 to-blue-100 px-8 py-6">
        <Image
          src="/logo-igreja.png"
          alt="Logo"
          width={100}
          height={100}
          className="w-full max-w-48"
        />
        <div className="flex flex-1 flex-col items-center">
          <div className="text-sm font-semibold tracking-widest uppercase">
            Relatórios Construção
          </div>
          <div className="text-5xl font-bold text-blue-900">AMERICANA</div>
          <div className="mt-2 rounded-full bg-blue-700 px-4 py-1 text-center text-sm font-bold text-white">
            Pagamentos efetuados para <br /> {report.supplierName.toUpperCase()}
          </div>
        </div>
        <Image
          src="/logo-hora-milagrosa.png"
          alt="Logo"
          width={100}
          height={100}
          className="w-full max-w-48"
        />
      </div>

      <div className="flex flex-col gap-4 px-8 py-4">
        <table className="border-border w-full border-separate border-spacing-0 overflow-hidden rounded-lg border">
          <thead>
            <tr>
              <th
                className="w-32 bg-slate-700 text-left text-white"
                style={thStyle}
              >
                DATA
              </th>
              <th className="bg-slate-700 text-left text-white" style={thStyle}>
                RESPONSÁVEL
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
            {report.transactions.length === 0 ? (
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
                  <td
                    className="text-right font-semibold text-[#990000]"
                    style={tdStyle}
                  >
                    {formatCurrency(t.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={2}
                className="bg-[#cc000022] text-right font-bold text-[#990000]"
                style={tdStyle}
              >
                Total
              </td>
              <td
                className="bg-[#cc000022] text-right font-bold text-[#990000]"
                style={tdStyle}
              >
                {formatCurrency(report.total)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Rodapé */}
        <div className="flex items-center justify-center gap-4">
          <p className="text-sm font-bold">Maria Odete Magalhães dos Santos</p>
          <p className="text-[10px]">(19) 98171-3557</p>
        </div>
      </div>
    </div>
  );
}
