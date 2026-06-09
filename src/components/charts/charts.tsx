"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const ACCENT = "#d4691e";
const GRID = "#2a2a2a";
const MUTED = "#8a8a8a";

const tooltipStyle = {
  backgroundColor: "#111111",
  border: "1px solid #2a2a2a",
  borderRadius: "0.5rem",
  color: "#f0f0f0",
  fontSize: "12px",
};

export function BarChartBrand({
  data,
  xKey,
  barKey,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  barKey: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: MUTED, fontSize: 11 }}
          axisLine={{ stroke: GRID }}
          tickLine={false}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tick={{ fill: MUTED, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(212,105,30,0.08)" }}
        />
        <Bar dataKey={barKey} fill={ACCENT} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineChartBrand({
  data,
  xKey,
  lineKey,
}: {
  data: Record<string, string | number>[];
  xKey: string;
  lineKey: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: MUTED, fontSize: 11 }}
          axisLine={{ stroke: GRID }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: MUTED, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            `R$ ${Number(v).toLocaleString("pt-BR", { notation: "compact" })}`
          }
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v: number | string) => [
            `R$ ${Number(v).toLocaleString("pt-BR")}`,
            "Receita",
          ]}
        />
        <Line
          type="monotone"
          dataKey={lineKey}
          stroke={ACCENT}
          strokeWidth={2}
          dot={{ fill: ACCENT, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
