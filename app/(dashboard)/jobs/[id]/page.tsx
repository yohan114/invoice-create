import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobById } from "@/lib/actions/jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StatusActions from "../StatusActions";
import DeleteJobButton from "../DeleteJobButton";

interface PageProps {
  params: Promise<{ id: string }>;
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

function getInvoiceStatusVariant(status: string) {
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

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{job.jobNumber}</h1>
          <Badge variant={getStatusVariant(job.status)}>
            {formatStatus(job.status)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/jobs/${job.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <DeleteJobButton id={job.id} jobNumber={job.jobNumber} />
        </div>
      </div>

      {/* Status Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Status Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusActions jobId={job.id} currentStatus={job.status} />
          {job.status === "DELIVERED" && (
            <p className="text-sm text-slate-500">This job has been delivered.</p>
          )}
          {job.status === "CANCELLED" && (
            <p className="text-sm text-slate-500">This job has been cancelled.</p>
          )}
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <CardTitle>Job Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">Customer</dt>
              <dd className="mt-1 text-sm text-slate-900">
                <Link href={`/customers/${job.customer.id}`} className="text-blue-600 hover:underline">
                  {job.customer.name}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Date</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {new Date(job.date).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Technician</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {job.technician?.name || "Unassigned"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Completion Date</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {job.completionDate
                  ? new Date(job.completionDate).toLocaleDateString()
                  : "-"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500">Item/Equipment Description</dt>
              <dd className="mt-1 text-sm text-slate-900">{job.itemDescription}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-slate-500">Problem Description</dt>
              <dd className="mt-1 text-sm text-slate-900">{job.problemDescription}</dd>
            </div>
            {job.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Notes</dt>
                <dd className="mt-1 text-sm text-slate-900">{job.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Related Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Related Invoices</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Invoice Number</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Total</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {job.invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                job.invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      Rs. {invoice.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getInvoiceStatusVariant(invoice.status)}>
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
  );
}
