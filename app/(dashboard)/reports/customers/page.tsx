import Link from "next/link";
import { getCustomerReport } from "@/lib/actions/reports";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default async function CustomerReportPage() {
  const customers = await getCustomerReport();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reports">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Customer History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Invoice Summary</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Total Invoices</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Total Amount</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Paid Amount</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No customer data available
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link href={`/customers/${customer.id}`} className="hover:text-blue-600">
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{customer.totalInvoices}</td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      Rs. {customer.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      Rs. {customer.paidAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      Rs. {(customer.totalAmount - customer.paidAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
