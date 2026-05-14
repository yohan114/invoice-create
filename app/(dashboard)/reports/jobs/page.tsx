import Link from "next/link";
import { getJobReport } from "@/lib/actions/reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { ArrowLeft } from "lucide-react";

function getStatusVariant(status: string) {
  switch (status) {
    case "PENDING":
      return "warning";
    case "IN_PROGRESS":
      return "info";
    case "COMPLETED":
      return "success";
    case "DELIVERED":
      return "success";
    case "CANCELLED":
      return "danger";
    default:
      return "default";
  }
}

export default async function JobReportPage() {
  const report = await getJobReport();

  const statuses = [
    { key: "PENDING", label: "Pending" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "COMPLETED", label: "Completed" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Job History</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-slate-600">Total Jobs</p>
          <p className="text-2xl font-bold text-slate-900">{report.total}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jobs by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {statuses.map((s) => (
              <div key={s.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <Badge variant={getStatusVariant(s.key)}>{s.label}</Badge>
                <span className="text-lg font-bold text-slate-900">
                  {report.statusCounts[s.key] || 0}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
