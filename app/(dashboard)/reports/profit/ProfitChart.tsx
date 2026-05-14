"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ProfitChartProps {
  data: { month: string; income: number; costs: number; profit: number }[];
}

export default function ProfitChart({ data }: ProfitChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No data available for the selected period
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
          <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
            formatter={(value, name) => [
              `Rs. ${Number(value).toLocaleString()}`,
              name === "income" ? "Income" : "Costs",
            ]}
          />
          <Legend />
          <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} name="Income" />
          <Bar dataKey="costs" fill="#ef4444" radius={[4, 4, 0, 0]} name="Costs" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
