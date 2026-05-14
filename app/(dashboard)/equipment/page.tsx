import Link from "next/link";
import { getEquipment } from "@/lib/actions/equipment";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Plus } from "lucide-react";
import DeleteEquipmentButton from "./DeleteEquipmentButton";
import EquipmentSearch from "./EquipmentSearch";

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function EquipmentPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const page = parseInt(params.page || "1", 10);
  const { equipment, total, totalPages } = await getEquipment(search, page, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Equipment</h1>
        <Link href="/equipment/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200">
          <EquipmentSearch defaultSearch={search} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Model</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Serial No.</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Registration No.</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {equipment.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No equipment found
                  </td>
                </tr>
              ) : (
                equipment.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link href={`/equipment/${item.id}`} className="text-blue-600 hover:underline">
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.modelNumber || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{item.customer.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.serialNumber || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">{item.registrationNumber || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/equipment/${item.id}/edit`}>
                          <Button variant="secondary" size="sm">Edit</Button>
                        </Link>
                        <DeleteEquipmentButton id={item.id} name={item.name} />
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
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} equipment
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link href={`/equipment?search=${search}&page=${page - 1}`}>
                  <Button variant="secondary" size="sm">Previous</Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/equipment?search=${search}&page=${page + 1}`}>
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
