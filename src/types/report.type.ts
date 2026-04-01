export type ReportTransaction = {
  id: string;
  supplierName: string;
  amount: number;
};

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
