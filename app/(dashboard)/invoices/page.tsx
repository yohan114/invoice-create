import Link from "next/link";
import { getInvoices, getInvoiceStatusCounts } from "@/lib/actions/invoices";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Plus } from "lucide-react";
import InvoiceSearch from "./InvoiceSearch";

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

function getStatusVariant(status: string) {
  switch (status) {
    case "DRAFT":
      return "default";
    case "SENT":
      return "info";
    case "PAID":
      return "success";
    case "PARTIALLY_PAID":
      return "warning";
    case "OVERDUE":
      return "danger";
    case "CANCELLED":
      return "default";
    default:
      return "default";
  }
}

function formatStatus(status: string) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SENT":
      return "Sent";
    case "PAID":
      return "Paid";
    case "PARTIALLY_PAID":
      return "Partially Paid";
    case "OVERDUE":
      return "Overdue";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export default async function InvoicesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "";
  const page = parseInt(params.page || "1", 10);

  const [{ invoices, total, totalPages }, statusCounts] = await Promise.all([
    getInvoices(search, status, page, 10),
    getInvoiceStatusCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
        <Link href="/invoices/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200">
          <InvoiceSearch
            defaultSearch={search}
            currentStatus={status}
            statusCounts={statusCounts}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Invoice #</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Grand Total</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Paid</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link href={`/invoices/${invoice.id}`} className="hover:text-blue-600">
                        {invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{invoice.customer.name}</td>
                    <td className="px-4 py-3 text-right text-slate-900 font-medium">
                      Rs. {invoice.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={getStatusVariant(invoice.status)}
                        className={invoice.status === "CANCELLED" ? "line-through" : ""}
                      >
                        {formatStatus(invoice.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      Rs. {invoice.paidAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/invoices/${invoice.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <Link href={`/invoices/${invoice.id}/edit`}>
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
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} invoices
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link href={`/invoices?search=${search}&status=${status}&page=${page - 1}`}>
                  <Button variant="secondary" size="sm">Previous</Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/invoices?search=${search}&status=${status}&page=${page + 1}`}>
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
