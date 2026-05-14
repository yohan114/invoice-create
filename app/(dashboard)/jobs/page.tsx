import Link from "next/link";
import { getJobs, getJobStatusCounts } from "@/lib/actions/jobs";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Plus } from "lucide-react";
import JobSearch from "./JobSearch";

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

function getStatusVariant(status: string) {
  switch (status) {
    case "PENDING":
      return "warning";
    case "IN_PROGRESS":
      return "info";
    case "COMPLETED":
      return "success";
    case "DELIVERED":
      return "default";
    case "CANCELLED":
      return "danger";
    default:
      return "default";
  }
}

function formatStatus(status: string) {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";
    case "PENDING":
      return "Pending";
    case "COMPLETED":
      return "Completed";
    case "DELIVERED":
      return "Delivered";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "";
  const page = parseInt(params.page || "1", 10);

  const [{ jobs, total, totalPages }, statusCounts] = await Promise.all([
    getJobs(search, status, page, 10),
    getJobStatusCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
        <Link href="/jobs/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Job
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200">
          <JobSearch
            defaultSearch={search}
            currentStatus={status}
            statusCounts={statusCounts}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Job Number</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Item/Equipment</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Technician</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No jobs found
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link href={`/jobs/${job.id}`} className="hover:text-blue-600">
                        {job.jobNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(job.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{job.customer.name}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                      {job.itemDescription}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {job.technician?.name || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(job.status)}>
                        {formatStatus(job.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/jobs/${job.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <Link href={`/jobs/${job.id}/edit`}>
                          <Button variant="secondary" size="sm">Edit</Button>
                        </Link>
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
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} jobs
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link href={`/jobs?search=${search}&status=${status}&page=${page - 1}`}>
                  <Button variant="secondary" size="sm">Previous</Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/jobs?search=${search}&status=${status}&page=${page + 1}`}>
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
