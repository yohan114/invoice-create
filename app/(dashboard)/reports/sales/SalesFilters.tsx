"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SalesFiltersProps {
  currentPeriod: string;
  currentStartDate: string;
  currentEndDate: string;
}

const PERIODS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "yearly", label: "Yearly" },
];

export default function SalesFilters({ currentPeriod, currentStartDate, currentEndDate }: SalesFiltersProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);

  function handlePeriodChange(period: string) {
    const params = new URLSearchParams();
    params.set("period", period);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    router.push(`/reports/sales?${params.toString()}`);
  }

  function handleDateFilter(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("period", currentPeriod);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    router.push(`/reports/sales?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePeriodChange(p.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              currentPeriod === p.key
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleDateFilter} className="flex items-center gap-3">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <span className="text-slate-500">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Filter
        </button>
      </form>
    </div>
  );
}
