import Link from "next/link";
import { getParts } from "@/lib/actions/inventory";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Plus } from "lucide-react";
import DeletePartButton from "./DeletePartButton";
import InventorySearch from "./InventorySearch";

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string; lowStock?: string }>;
}

function getStockBadge(quantity: number, reorderLevel: number) {
  if (quantity === 0) {
    return <Badge variant="danger">Out of Stock</Badge>;
  }
  if (quantity <= reorderLevel) {
    return <Badge variant="warning">Low Stock</Badge>;
  }
  return <Badge variant="success">In Stock</Badge>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);
  const lowStockOnly = params.lowStock === "true";
  const { parts, total, totalPages } = await getParts(search, page, 10, lowStockOnly);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
        <Link href="/inventory/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Part
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200">
          <InventorySearch defaultSearch={search} defaultLowStock={lowStockOnly} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Quantity</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Unit</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Unit Price</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Cost Price</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Supplier</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Stock Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {parts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No parts found
                  </td>
                </tr>
              ) : (
                parts.map((part) => (
                  <tr key={part.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{part.name}</td>
                    <td className="px-4 py-3 text-slate-600">{part.quantity}</td>
                    <td className="px-4 py-3 text-slate-600">{part.unit}</td>
                    <td className="px-4 py-3 text-slate-600">
                      Rs. {part.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Rs. {part.costPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{part.supplier || "-"}</td>
                    <td className="px-4 py-3">
                      {getStockBadge(part.quantity, part.reorderLevel)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/inventory/${part.id}/edit`}>
                          <Button variant="secondary" size="sm">Edit</Button>
                        </Link>
                        <DeletePartButton id={part.id} name={part.name} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} parts
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link href={`/inventory?search=${search}&lowStock=${lowStockOnly}&page=${page - 1}`}>
                  <Button variant="secondary" size="sm">Previous</Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/inventory?search=${search}&lowStock=${lowStockOnly}&page=${page + 1}`}>
                  <Button variant="secondary" size="sm">Next</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
