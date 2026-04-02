export type ReportTransaction = {
  id: string;
  supplierName: string;
  amount: number;
};

// Relatório mensal
export type ReportData = {
  month: number;
  year: number;
  previousBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalEntradas: number;
  balance: number;
  incomeTransactions: ReportTransaction[];
  expenseTransactions: ReportTransaction[];
};

// Relatório por fornecedor
export type SupplierReportRow = {
  id: string;
  date: string;
  responsibleName: string;
  amount: number;
};

export type SupplierReportData = {
  supplierId: string;
  supplierName: string;
  total: number;
  transactions: SupplierReportRow[];
};
