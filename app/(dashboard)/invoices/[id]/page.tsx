import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoiceById } from "@/lib/actions/invoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DeleteInvoiceButton from "../DeleteInvoiceButton";
import ConvertToTaxInvoiceButton from "./ConvertToTaxInvoiceButton";

interface PageProps {
  params: Promise<{ id: string }>;
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

function formatItemType(type: string) {
  switch (type) {
    case "PART":
      return "Part";
    case "LABOUR":
      return "Labour";
    case "SERVICE":
      return "Service";
    case "TECHNICAL_CHARGE":
      return "Technical Charge";
    case "TRANSPORT":
      return "Transport";
    case "SUNDRY":
      return "Sundry";
    default:
      return type;
  }
}

function getInvoiceTypeVariant(type: string) {
  switch (type) {
    case "PROFORMA":
      return "warning";
    case "TAX_INVOICE":
      return "info";
    default:
      return "default";
  }
}

function formatInvoiceType(type: string) {
  switch (type) {
    case "PROFORMA":
      return "Proforma";
    case "TAX_INVOICE":
      return "Tax Invoice";
    default:
      return type;
  }
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.round((invoice.grandTotal - paidAmount + Number.EPSILON) * 100) / 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{invoice.invoiceNumber}</h1>
          <Badge variant={getStatusVariant(invoice.status)}>
            {formatStatus(invoice.status)}
          </Badge>
          <Badge variant={getInvoiceTypeVariant(invoice.invoiceType)}>
            {formatInvoiceType(invoice.invoiceType)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {invoice.invoiceType === "PROFORMA" && (
            <ConvertToTaxInvoiceButton id={invoice.id} />
          )}
          <Link href={`/invoices/${invoice.id}/print`}>
            <Button variant="secondary">Print / PDF</Button>
          </Link>
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Link href={`/payments/new?invoiceId=${invoice.id}`}>
            <Button>Record Payment</Button>
          </Link>
          <DeleteInvoiceButton id={invoice.id} invoiceNumber={invoice.invoiceNumber} />
        </div>
      </div>

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-slate-500">Invoice Date</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {new Date(invoice.invoiceDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Due Date</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Customer</dt>
              <dd className="mt-1 text-sm text-slate-900">
                <Link href={`/customers/${invoice.customer.id}`} className="text-blue-600 hover:underline">
                  {invoice.customer.name}
                </Link>
              </dd>
            </div>
            {invoice.job && (
              <div>
                <dt className="text-sm font-medium text-slate-500">Job Reference</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  <Link href={`/jobs/${invoice.job.id}`} className="text-blue-600 hover:underline">
                    {invoice.job.jobNumber}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Additional Details */}
      {(invoice.poNumber || invoice.deliveryDate || invoice.grnNumber || invoice.paymentTerms || invoice.referenceNumber || invoice.deliveryAddress) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {invoice.poNumber && (
                <div>
                  <dt className="text-sm font-medium text-slate-500">PO Number</dt>
                  <dd className="mt-1 text-sm text-slate-900">{invoice.poNumber}</dd>
                </div>
              )}
              {invoice.poDate && (
                <div>
                  <dt className="text-sm font-medium text-slate-500">PO Date</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {new Date(invoice.poDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {invoice.deliveryDate && (
                <div>
                  <dt className="text-sm font-medium text-slate-500">Delivery Date</dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {new Date(invoice.deliveryDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
              {invoice.grnNumber && (
                <div>
                  <dt className="text-sm font-medium text-slate-500">GRN Number</dt>
                  <dd className="mt-1 text-sm text-slate-900">{invoice.grnNumber}</dd>
                </div>
              )}
              {invoice.paymentTerms && (
                <div>
                  <dt className="text-sm font-medium text-slate-500">Payment Terms</dt>
                  <dd className="mt-1 text-sm text-slate-900">{invoice.paymentTerms}</dd>
                </div>
              )}
              {invoice.referenceNumber && (
                <div>
                  <dt className="text-sm font-medium text-slate-500">Reference Number</dt>
                  <dd className="mt-1 text-sm text-slate-900">{invoice.referenceNumber}</dd>
                </div>
              )}
              {invoice.deliveryAddress && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">Delivery Address</dt>
                  <dd className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{invoice.deliveryAddress}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">S.No</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Rate</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                  <td className="px-4 py-3 text-slate-900">{item.description}</td>
                  <td className="px-4 py-3 text-slate-600">{formatItemType(item.type)}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    Rs. {item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">
                    Rs. {item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-slate-200 px-4 py-4">
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span>Rs. {invoice.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              {invoice.discountPercent > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount ({invoice.discountPercent}%)</span>
                  <span>- Rs. {invoice.discountAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {invoice.ssclPercent > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">SSCL ({invoice.ssclPercent}%)</span>
                  <span>Rs. {invoice.ssclAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {invoice.taxPercent > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax/VAT ({invoice.taxPercent}%)</span>
                  <span>Rs. {invoice.taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-300 pt-2 font-bold text-base">
                <span>Grand Total</span>
                <span>Rs. {invoice.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Method</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Reference</th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No payments recorded
                  </td>
                </tr>
              ) : (
                invoice.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{payment.method}</td>
                    <td className="px-4 py-3 text-slate-600">{payment.reference || "-"}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      Rs. {payment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 px-4 py-3">
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Paid</span>
                <span className="font-medium text-green-600">
                  Rs. {paidAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Balance Due</span>
                <span className={balanceDue > 0 ? "text-red-600" : "text-green-600"}>
                  Rs. {balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      {(invoice.notes || invoice.termsAndConditions) && (
        <Card>
          <CardContent className="space-y-4">
            {invoice.notes && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">Notes</h4>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            {invoice.termsAndConditions && (
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-1">Terms & Conditions</h4>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">{invoice.termsAndConditions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
