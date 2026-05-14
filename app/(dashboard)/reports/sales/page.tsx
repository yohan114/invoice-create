import { getSalesReport } from "@/lib/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import SalesChart from "./SalesChart";
import SalesFilters from "./SalesFilters";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ period?: string; startDate?: string; endDate?: string }>;
}

export default async function SalesReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = (params.period || "monthly") as "daily" | "weekly" | "monthly" | "yearly";
  const startDate = params.startDate || "";
  const endDate = params.endDate || "";

  const report = await getSalesReport(period, startDate || undefined, endDate || undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Sales Report</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <SalesFilters currentPeriod={period} currentStartDate={startDate} currentEndDate={endDate} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-900">
              Rs. {report.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Number of Invoices</p>
            <p className="text-2xl font-bold text-slate-900">{report.totalInvoices}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Average Invoice Value</p>
            <p className="text-2xl font-bold text-slate-900">
              Rs. {report.averageValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <SalesChart data={report.data} />
        </CardContent>
      </Card>
    </div>
  );
}
