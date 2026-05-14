import {
  DollarSign,
  FileText,
  CheckCircle,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  getDashboardMetrics,
  getRecentInvoices,
  getMonthlyRevenue,
} from "@/lib/actions/dashboard";
import RevenueChart from "./RevenueChart";

function getStatusVariant(status: string) {
  switch (status) {
    case "PAID":
      return "success";
    case "SENT":
      return "info";
    case "OVERDUE":
      return "danger";
    case "DRAFT":
      return "default";
    case "PARTIALLY_PAID":
      return "warning";
    case "CANCELLED":
      return "danger";
    default:
      return "default";
  }
}

export default async function DashboardPage() {
  const [metrics, recentInvoices, monthlyRevenue] = await Promise.all([
    getDashboardMetrics(),
    getRecentInvoices(),
    getMonthlyRevenue(),
  ]);

  const summaryCards = [
    {
      label: "Total Sales",
      value: `Rs. ${metrics.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Pending Invoices",
      value: metrics.pendingInvoices.toString(),
      icon: FileText,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      label: "Completed Jobs",
      value: metrics.completedJobs.toString(),
      icon: CheckCircle,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Jobs In Progress",
      value: metrics.jobsInProgress.toString(),
      icon: Wrench,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Low Stock Parts",
      value: metrics.lowStockParts.toString(),
      icon: AlertTriangle,
      color: "text-red-600 bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className={`rounded-lg p-3 ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="text-lg font-semibold text-slate-900">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart and Recent Invoices */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <Card>
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Monthly Revenue</h2>
          </div>
          <CardContent>
            <RevenueChart data={monthlyRevenue} />
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Recent Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Invoice</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No invoices yet
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{invoice.customerName}</td>
                      <td className="px-4 py-3 text-slate-600">
                        Rs. {invoice.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(invoice.status)}>
                          {invoice.status}
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
    </div>
  );
}
