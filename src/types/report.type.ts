// ─── Relatório mensal ─────────────────────────────────────────────────────────

import { TransactionType } from "@/generated/prisma/enums";

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

// ─── Relatório por fornecedor ─────────────────────────────────────────────────

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

// ─── Relatório anual ──────────────────────────────────────────────────────────

export type AnnualReportMonth = {
  month: number; // 1–12
  income: number;
  expense: number;
};

export type AnnualReportData = {
  year: number;
  previousYearBalance: number;
  months: AnnualReportMonth[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

// ─── Relatório de entradas ────────────────────────────────────────────────────

export type TransactionsReportRow = {
  id: string;
  type: TransactionType;
  date: string;
  responsibleName: string;
  supplierName: string | null;
  paymentMethod: string;
  amount: number;
};

export type TransactionsReportData = {
  transactions: TransactionsReportRow[];
  total: number;
  filters: {
    month: number | null;
    year: number | null;
    supplierId: string | null;
    supplierName: string | null;
    responsibleName: string | null;
    type: string | null;
  };
};
