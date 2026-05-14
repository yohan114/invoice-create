"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

interface PaymentSearchProps {
  defaultSearch: string;
  currentMethod: string;
}

const METHODS = [
  { key: "", label: "All Methods" },
  { key: "CASH", label: "Cash" },
  { key: "CARD", label: "Card" },
  { key: "BANK_TRANSFER", label: "Bank Transfer" },
  { key: "CHEQUE", label: "Cheque" },
  { key: "ONLINE", label: "Online" },
];

export default function PaymentSearch({ defaultSearch, currentMethod }: PaymentSearchProps) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (currentMethod) params.set("method", currentMethod);
    params.set("page", "1");
    router.push(`/payments?${params.toString()}`);
  }

  function handleMethodChange(method: string) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (method) params.set("method", method);
    params.set("page", "1");
    router.push(`/payments?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice # or customer..."
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

      <select
        value={currentMethod}
        onChange={(e) => handleMethodChange(e.target.value)}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
      >
        {METHODS.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
