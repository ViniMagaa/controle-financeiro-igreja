export const thStyle: React.CSSProperties = {
  padding: "2px 14px",
  fontWeight: 700,
  letterSpacing: "0.5px",
  fontSize: "12px",
};

export const tdStyle: React.CSSProperties = {
  padding: "2px 14px",
  borderBottom: "1px solid #f1f5f9",
  fontSize: "12px",
};

// ─── Wrapper ──────────────────────────────────────────────────────────────────

type ReportTableProps = {
  head: React.ReactNode;
  body: React.ReactNode;
  foot?: React.ReactNode;
};

export function ReportTable({ head, body, foot }: ReportTableProps) {
  return (
    <table className="border-border w-full border-separate border-spacing-0 overflow-hidden rounded-lg border">
      <thead>{head}</thead>
      <tbody>{body}</tbody>
      {foot && <tfoot>{foot}</tfoot>}
    </table>
  );
}

// ─── Células de cabeçalho ─────────────────────────────────────────────────────

type ThProps = {
  children: React.ReactNode;
  className?: string;
  right?: boolean;
};

export function ThBlue({ children, className = "", right = false }: ThProps) {
  return (
    <th
      className={`bg-blue-950 text-white ${right ? "text-right" : "text-left"} ${className}`}
      style={thStyle}
    >
      {children}
    </th>
  );
}

export function ThSlate({ children, className = "", right = false }: ThProps) {
  return (
    <th
      className={`bg-slate-700 text-white ${right ? "text-right" : "text-left"} ${className}`}
      style={thStyle}
    >
      {children}
    </th>
  );
}

// ─── Células de corpo ─────────────────────────────────────────────────────────

type TdProps = {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
};

export function TdGreen({ children, className = "", colSpan }: TdProps) {
  return (
    <td
      colSpan={colSpan}
      className={`text-right font-semibold text-[#00cc00] ${className}`}
      style={tdStyle}
    >
      {children}
    </td>
  );
}

export function TdRed({ children, className = "", colSpan }: TdProps) {
  return (
    <td
      colSpan={colSpan}
      className={`text-right font-semibold text-[#990000] ${className}`}
      style={tdStyle}
    >
      {children}
    </td>
  );
}

// ─── Células de rodapé ────────────────────────────────────────────────────────

export function TfBlue({ children, className = "", colSpan }: TdProps) {
  return (
    <td
      colSpan={colSpan}
      className={`bg-blue-100 font-bold text-blue-900 ${className}`}
      style={tdStyle}
    >
      {children}
    </td>
  );
}

export function TfRed({ children, className = "", colSpan }: TdProps) {
  return (
    <td
      colSpan={colSpan}
      className={`bg-[#cc000022] font-bold text-[#990000] ${className}`}
      style={tdStyle}
    >
      {children}
    </td>
  );
}
