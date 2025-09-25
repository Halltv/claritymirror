"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

interface OverviewChartProps {
  data: {
    month: string;
    orcamentos: number;
    pedidos: number;
  }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value / 1000}k`}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--accent))", opacity: 0.5 }}
          contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
        />
        <Legend
          iconSize={10}
          wrapperStyle={{
            paddingTop: "20px",
          }}
        />
        <Bar dataKey="orcamentos" name="Orçamentos (Valor)" fill="hsl(var(--primary) / 0.3)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="pedidos" name="Pedidos (Valor)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
