import Link from "next/link";
import { getInventoryReport } from "@/lib/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import InventoryChart from "./InventoryChart";

export default async function InventoryReportPage() {
  const report = await getInventoryReport();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Inventory Usage Report</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-slate-600">Total Inventory Value</p>
          <p className="text-2xl font-bold text-slate-900">
            Rs. {report.totalInventoryValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Used Parts</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryChart data={report.topUsedParts} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Stock Value</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Part Name</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Unit Price</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Total Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.stockItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No inventory items
                  </td>
                </tr>
              ) : (
                report.stockItems.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      Rs. {item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      Rs. {item.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
