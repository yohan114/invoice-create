import Link from "next/link";
import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/actions/customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DeleteCustomerButton from "../DeleteCustomerButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getJobStatusVariant(status: string) {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
      return "info";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "danger";
    case "DELIVERED":
      return "success";
    default:
      return "default";
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

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
        <div className="flex items-center gap-2">
          <Link href={`/customers/${customer.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <DeleteCustomerButton id={customer.id} name={customer.name} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">Phone</dt>
              <dd className="mt-1 text-sm text-slate-900">{customer.phone || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Email</dt>
              <dd className="mt-1 text-sm text-slate-900">{customer.email || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Address</dt>
              <dd className="mt-1 text-sm text-slate-900">{customer.address || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Tax/VAT Number</dt>
              <dd className="mt-1 text-sm text-slate-900">{customer.taxNumber || "-"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Related Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Job Number</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Item</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customer.jobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No jobs found
                  </td>
                </tr>
              ) : (
                customer.jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{job.jobNumber}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(job.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{job.itemDescription}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getJobStatusVariant(job.status)}>{job.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Related Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
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
              {customer.invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                customer.invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{invoice.invoiceNumber}</td>
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
