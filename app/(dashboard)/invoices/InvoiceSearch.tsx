"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

interface StatusCount {
  all: number;
  draft: number;
  sent: number;
  paid: number;
  partiallyPaid: number;
  overdue: number;
  cancelled: number;
}

interface InvoiceSearchProps {
  defaultSearch: string;
  currentStatus: string;
  statusCounts: StatusCount;
}

const STATUS_TABS = [
  { key: "", label: "All", countKey: "all" as const },
  { key: "DRAFT", label: "Draft", countKey: "draft" as const },
  { key: "SENT", label: "Sent", countKey: "sent" as const },
  { key: "PAID", label: "Paid", countKey: "paid" as const },
  { key: "PARTIALLY_PAID", label: "Partially Paid", countKey: "partiallyPaid" as const },
  { key: "OVERDUE", label: "Overdue", countKey: "overdue" as const },
  { key: "CANCELLED", label: "Cancelled", countKey: "cancelled" as const },
];

export default function InvoiceSearch({ defaultSearch, currentStatus, statusCounts }: InvoiceSearchProps) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (currentStatus) params.set("status", currentStatus);
    params.set("page", "1");
    router.push(`/invoices?${params.toString()}`);
  }

  function handleStatusChange(status: string) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    params.set("page", "1");
    router.push(`/invoices?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusChange(tab.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              currentStatus === tab.key
                ? "bg-blue-100 text-blue-700"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs font-normal">({statusCounts[tab.countKey]})</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Search
        </button>
      </form>
    </div>
  );
}
