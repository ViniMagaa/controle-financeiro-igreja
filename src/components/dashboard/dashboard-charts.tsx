"use client";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import { formatCurrency } from "@/utils/format-currency";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { ChartsData } from "@/types/chart.type";

// ─── Cores do donut — 5 tons de azul coerentes com o projeto ─────────────────

const DONUT_COLORS = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

// ─── Configs dos gráficos ─────────────────────────────────────────────────────

const lineConfig: ChartConfig = {
  balance: { label: "Saldo acumulado", color: "--color-primary" },
};

const barConfig: ChartConfig = {
  income: { label: "Entradas", color: "#16a34a" },
  expense: { label: "Saídas", color: "#dc2626" },
};

// ─── Seletor de ano ───────────────────────────────────────────────────────────

const now = new Date();
const yearOptions = Array.from({ length: 4 }, (_, i) => {
  const y = now.getFullYear() - i;
  return { value: y.toString(), label: y.toString() };
});

// ─── Formatador de eixo Y ─────────────────────────────────────────────────────

function formatY(v: number) {
  if (Math.abs(v) >= 1000) return `R$${(v / 1000).toFixed(0)}k`;
  return `R$${v}`;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function DashboardCharts() {
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<ChartsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCharts = useCallback(async () => {
    setLoading(true);
    const { data: result, error } = await api.get<ChartsData>(
      "/api/dashboard/charts",
      {
        params: { year: String(year) },
      },
    );
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    setData(result);
    setLoading(false);
  }, [year]);

  useEffect(() => {
    async function fetch() {
      fetchCharts();
    }
    fetch();
  }, [fetchCharts]);

  return (
    <div className="mt-8 space-y-6">
      {/* Seletor de ano — compartilhado pelos 3 gráficos */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Visão anual</h2>
        <div className="w-32">
          <Select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            options={yearOptions}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`border-border animate-pulse rounded-lg border p-4 ${i === 2 ? "sm:col-span-2" : ""}`}
            >
              <div className="bg-muted mb-3 h-4 w-32 rounded" />
              <div className="bg-muted h-48 rounded" />
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Gráfico de linha — saldo acumulado */}
          <ChartCard
            title="Evolução do saldo"
            subtitle="Saldo acumulado mês a mês"
          >
            <ChartContainer config={lineConfig} className="h-52 w-full">
              <AreaChart
                data={data.lineData}
                margin={{ left: 8, right: 8, top: 4, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={formatY}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#balanceGrad)"
                  dot={false}
                />
              </AreaChart>
            </ChartContainer>
          </ChartCard>

          {/* Gráfico de barras — entradas vs saídas */}
          <ChartCard title="Entradas vs Saídas" subtitle="Comparativo mensal">
            <ChartContainer config={barConfig} className="h-52 w-full">
              <BarChart
                data={data.barData}
                margin={{ left: 8, right: 8, top: 4, bottom: 0 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={formatY}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        <b key={name}>
                          {name === "income" ? "Entradas" : "Saídas"}
                        </b>,
                        formatCurrency(Number(value)),
                      ]}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income" fill="#16a34a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" fill="#dc2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </ChartCard>

          {/* Donut — top 5 fornecedores */}
          <ChartCard
            title="Fornecedores"
            subtitle={`Maiores pagamentos em ${year}`}
            className="sm:col-span-2"
          >
            {data.donutData.length === 0 ? (
              <p className="text-muted-foreground py-12 text-center text-sm">
                Nenhum pagamento registrado para fornecedores neste ano.
              </p>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                {/* Pizza */}
                <div className="h-52 w-full max-w-xs shrink-0">
                  <ChartContainer
                    config={Object.fromEntries(
                      data.donutData.map((d, i) => [
                        d.name,
                        { label: d.name, color: DONUT_COLORS[i] },
                      ]),
                    )}
                    className="h-full w-full"
                  >
                    <PieChart>
                      <Pie
                        data={data.donutData}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={3}
                      >
                        {data.donutData.map((_, i) => (
                          <Cell key={i} fill={DONUT_COLORS[i]} />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) => [
                              <b key={name}>{name}</b>,
                              formatCurrency(Number(value)),
                            ]}
                          />
                        }
                      />
                    </PieChart>
                  </ChartContainer>
                </div>

                {/* Legenda com valores */}
                <div className="w-full space-y-2">
                  {(() => {
                    const total = data.donutData.reduce(
                      (acc, d) => acc + d.total,
                      0,
                    );
                    return data.donutData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-3">
                        <div
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: DONUT_COLORS[i] }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-medium">
                              {d.name}
                            </span>
                            <span className="text-muted-foreground shrink-0 text-xs">
                              {formatCurrency(d.total)}
                            </span>
                          </div>
                          {/* Barra de progresso relativa */}
                          <div className="bg-muted mt-1 h-1.5 w-full overflow-hidden rounded-full">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(d.total / total) * 100}%`,
                                backgroundColor: DONUT_COLORS[i],
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      ) : null}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-border rounded-lg border p-4 ${className}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-muted-foreground mb-4 text-xs">{subtitle}</p>
      {children}
    </div>
  );
}
