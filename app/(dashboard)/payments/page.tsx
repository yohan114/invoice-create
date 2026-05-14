import Link from "next/link";
import { getPayments } from "@/lib/actions/payments";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Plus } from "lucide-react";
import PaymentSearch from "./PaymentSearch";
import DeletePaymentButton from "./DeletePaymentButton";

interface PageProps {
  searchParams: Promise<{ search?: string; method?: string; page?: string }>;
}

function getMethodBadgeVariant(method: string) {
  switch (method) {
    case "CASH":
      return "success";
    case "CARD":
      return "info";
    case "BANK_TRANSFER":
      return "warning";
    case "CHEQUE":
      return "default";
    case "ONLINE":
      return "info";
    default:
      return "default";
  }
}

function formatMethod(method: string) {
  switch (method) {
    case "CASH":
      return "Cash";
    case "CARD":
      return "Card";
    case "BANK_TRANSFER":
      return "Bank Transfer";
    case "CHEQUE":
      return "Cheque";
    case "ONLINE":
      return "Online";
    default:
      return method;
  }
}

export default async function PaymentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const method = params.method || "";
  const page = parseInt(params.page || "1", 10);

  const { payments, total, totalPages } = await getPayments(search, method, page, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
        <Link href="/payments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200">
          <PaymentSearch defaultSearch={search} currentMethod={method} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Invoice #</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Amount (Rs.)</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Method</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Reference</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link href={`/invoices/${payment.invoice.id}`} className="hover:text-blue-600">
                        {payment.invoice.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{payment.invoice.customer.name}</td>
                    <td className="px-4 py-3 text-right text-slate-900 font-medium">
                      Rs. {payment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getMethodBadgeVariant(payment.method)}>
                        {formatMethod(payment.method)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{payment.reference || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/payments/${payment.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <DeletePaymentButton id={payment.id} />
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
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} payments
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link href={`/payments?search=${search}&method=${method}&page=${page - 1}`}>
                  <Button variant="secondary" size="sm">Previous</Button>
                </Link>
              )}
              {page < totalPages && (
                <Link href={`/payments?search=${search}&method=${method}&page=${page + 1}`}>
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
