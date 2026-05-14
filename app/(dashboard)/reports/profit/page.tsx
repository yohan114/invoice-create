import Link from "next/link";
import { getProfitReport } from "@/lib/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import ProfitChart from "./ProfitChart";
import ProfitFilters from "./ProfitFilters";

interface PageProps {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}

export default async function ProfitReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const startDate = params.startDate || "";
  const endDate = params.endDate || "";

  const report = await getProfitReport(startDate || undefined, endDate || undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Profit Report</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <ProfitFilters currentStartDate={startDate} currentEndDate={endDate} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Total Income</p>
            <p className="text-2xl font-bold text-green-600">
              Rs. {report.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Total Parts Cost</p>
            <p className="text-2xl font-bold text-red-600">
              Rs. {report.totalPartsCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Gross Profit</p>
            <p className="text-2xl font-bold text-slate-900">
              Rs. {report.grossProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Profit Margin</p>
            <p className="text-2xl font-bold text-slate-900">{report.profitMargin}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income vs Costs by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfitChart data={report.chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Month</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Income</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Parts Cost</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.chartData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    No data available
                  </td>
                </tr>
              ) : (
                report.chartData.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-900 font-medium">{row.month}</td>
                    <td className="px-4 py-3 text-right text-green-600">
                      Rs. {row.income.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      Rs. {row.costs.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      Rs. {row.profit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
