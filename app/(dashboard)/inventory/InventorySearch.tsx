"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

interface InventorySearchProps {
  defaultSearch: string;
  defaultLowStock: boolean;
}

export default function InventorySearch({ defaultSearch, defaultLowStock }: InventorySearchProps) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultSearch);
  const [lowStock, setLowStock] = useState(defaultLowStock);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (lowStock) params.set("lowStock", "true");
    params.set("page", "1");
    router.push(`/inventory?${params.toString()}`);
  }

  function toggleLowStock() {
    const newLowStock = !lowStock;
    setLowStock(newLowStock);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (newLowStock) params.set("lowStock", "true");
    params.set("page", "1");
    router.push(`/inventory?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search parts..."
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
      <button
        type="button"
        onClick={toggleLowStock}
        className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          lowStock
            ? "bg-yellow-100 text-yellow-800 border-yellow-300 focus:ring-yellow-500"
            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 focus:ring-slate-500"
        }`}
      >
        Low Stock
      </button>
    </form>
  );
}
