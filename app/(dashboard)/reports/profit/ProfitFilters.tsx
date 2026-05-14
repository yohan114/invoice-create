"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfitFiltersProps {
  currentStartDate: string;
  currentEndDate: string;
}

export default function ProfitFilters({ currentStartDate, currentEndDate }: ProfitFiltersProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);

  function handleFilter(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    router.push(`/reports/profit?${params.toString()}`);
  }

  return (
    <form onSubmit={handleFilter} className="flex items-center gap-3">
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
  );
}
