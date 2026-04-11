export type LineRow = { month: string; balance: number };
export type BarRow = { month: string; income: number; expense: number };
export type DonutRow = { name: string; total: number };

export type ChartsData = {
  lineData: LineRow[];
  barData: BarRow[];
  donutData: DonutRow[];
  year: number;
};
