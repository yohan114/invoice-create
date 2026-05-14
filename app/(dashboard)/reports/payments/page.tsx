import Link from "next/link";
import { getPendingPaymentsReport } from "@/lib/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

function getStatusVariant(status: string) {
  switch (status) {
    case "DRAFT":
      return "default";
    case "SENT":
      return "info";
    case "PARTIALLY_PAID":
      return "warning";
    case "OVERDUE":
      return "danger";
    default:
      return "default";
  }
}

export default async function PendingPaymentsReportPage() {
  const report = await getPendingPaymentsReport();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Pending Payments</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Total Outstanding</p>
            <p className="text-2xl font-bold text-slate-900">
              Rs. {report.totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Overdue Invoices</p>
            <p className="text-2xl font-bold text-red-600">{report.overdueCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Avg. Days Overdue</p>
            <p className="text-2xl font-bold text-slate-900">{report.avgDaysOverdue}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Invoices</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Invoice #</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Amount Due</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Due Date</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Days Overdue</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No outstanding invoices
                  </td>
                </tr>
              ) : (
                report.invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link href={`/invoices/${inv.id}`} className="hover:text-blue-600">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{inv.customerName}</td>
                    <td className="px-4 py-3 text-right text-slate-900 font-medium">
                      Rs. {inv.amountDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={inv.daysOverdue > 0 ? "text-red-600 font-medium" : "text-slate-600"}>
                        {inv.daysOverdue > 0 ? inv.daysOverdue : "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(inv.status)}>
                        {inv.status.replace("_", " ")}
                      </Badge>
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
