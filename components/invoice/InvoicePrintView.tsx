"use client";

interface InvoiceItem {
  id: string;
  type: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Payment {
  id: string;
  amount: number;
  paymentDate: Date | string;
  method: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date | string;
  dueDate: Date | string | null;
  status: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  notes: string | null;
  termsAndConditions: string | null;
  customer: {
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    taxNumber: string | null;
  };
  job: {
    jobNumber: string;
    itemDescription: string;
  } | null;
  items: InvoiceItem[];
  payments: Payment[];
}

interface CompanyData {
  companyName: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  taxNumber: string | null;
}

interface InvoicePrintViewProps {
  invoice: InvoiceData;
  company: CompanyData | null;
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

export default function InvoicePrintView({ invoice, company }: InvoicePrintViewProps) {
  const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = Math.round((invoice.grandTotal - paidAmount + Number.EPSILON) * 100) / 100;

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto text-slate-900 text-sm print:p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {company?.companyName || "Company Name"}
          </h1>
          {company?.address && (
            <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">{company.address}</p>
          )}
          {company?.phone && <p className="text-sm text-slate-600">Phone: {company.phone}</p>}
          {company?.email && <p className="text-sm text-slate-600">Email: {company.email}</p>}
          {company?.taxNumber && (
            <p className="text-sm text-slate-600">Tax No: {company.taxNumber}</p>
          )}
        </div>
        {company?.logo && (
          <div className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={company.logo} alt="Company Logo" className="h-16 w-auto" />
          </div>
        )}
      </div>

      {/* Invoice Details Box */}
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wide text-slate-700 mb-2">Invoice</h2>
          <table className="text-sm">
            <tbody>
              <tr>
                <td className="pr-4 py-0.5 font-medium text-slate-600">Invoice No:</td>
                <td className="py-0.5 font-bold">{invoice.invoiceNumber}</td>
              </tr>
              <tr>
                <td className="pr-4 py-0.5 font-medium text-slate-600">Date:</td>
                <td className="py-0.5">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
              </tr>
              {invoice.dueDate && (
                <tr>
                  <td className="pr-4 py-0.5 font-medium text-slate-600">Due Date:</td>
                  <td className="py-0.5">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                </tr>
              )}
              <tr>
                <td className="pr-4 py-0.5 font-medium text-slate-600">Status:</td>
                <td className="py-0.5 font-medium">{invoice.status.replace("_", " ")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bill To */}
        <div className="text-right">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600 mb-2">Bill To</h3>
          <p className="font-bold text-base">{invoice.customer.name}</p>
          {invoice.customer.address && (
            <p className="text-slate-600 whitespace-pre-line">{invoice.customer.address}</p>
          )}
          {invoice.customer.phone && <p className="text-slate-600">Phone: {invoice.customer.phone}</p>}
          {invoice.customer.email && <p className="text-slate-600">Email: {invoice.customer.email}</p>}
          {invoice.customer.taxNumber && (
            <p className="text-slate-600">Tax No: {invoice.customer.taxNumber}</p>
          )}
        </div>
      </div>

      {/* Job Reference */}
      {invoice.job && (
        <div className="mb-4 px-3 py-2 bg-slate-50 rounded border border-slate-200">
          <span className="font-medium text-slate-600">Job Reference: </span>
          <span className="font-bold">{invoice.job.jobNumber}</span>
          <span className="text-slate-600"> - {invoice.job.itemDescription}</span>
        </div>
      )}

      {/* Line Items Table */}
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="px-3 py-2 text-left text-xs font-medium w-10">S.No</th>
            <th className="px-3 py-2 text-left text-xs font-medium">Description</th>
            <th className="px-3 py-2 text-left text-xs font-medium w-28">Type</th>
            <th className="px-3 py-2 text-right text-xs font-medium w-14">Qty</th>
            <th className="px-3 py-2 text-right text-xs font-medium w-24">Rate</th>
            <th className="px-3 py-2 text-right text-xs font-medium w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, index) => (
            <tr key={item.id} className="border-b border-slate-200">
              <td className="px-3 py-2 text-slate-600">{index + 1}</td>
              <td className="px-3 py-2">{item.description}</td>
              <td className="px-3 py-2 text-slate-600">{formatItemType(item.type)}</td>
              <td className="px-3 py-2 text-right">{item.quantity}</td>
              <td className="px-3 py-2 text-right">
                {item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
              <td className="px-3 py-2 text-right font-medium">
                {item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-72">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-600">Subtotal</span>
            <span>Rs. {invoice.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
          {invoice.discountPercent > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-200 text-red-600">
              <span>Discount ({invoice.discountPercent}%)</span>
              <span>- Rs. {invoice.discountAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          {invoice.taxPercent > 0 && (
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-600">Tax/VAT ({invoice.taxPercent}%)</span>
              <span>Rs. {invoice.taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between py-2 font-bold text-base border-b-2 border-slate-800">
            <span>Grand Total</span>
            <span>Rs. {invoice.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="mb-6 p-3 bg-slate-50 rounded border border-slate-200">
        <h3 className="font-bold text-sm mb-1">Payment Status</h3>
        <div className="flex justify-between text-sm">
          <span>Total Paid: Rs. {paidAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          <span className="font-bold">
            Balance Due: Rs. {balanceDue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Terms & Conditions */}
      {invoice.termsAndConditions && (
        <div className="mb-6">
          <h3 className="font-bold text-xs uppercase tracking-wide text-slate-600 mb-1">
            Terms & Conditions
          </h3>
          <p className="text-xs text-slate-600 whitespace-pre-line">{invoice.termsAndConditions}</p>
        </div>
      )}

      {/* Signature Area */}
      <div className="grid grid-cols-3 gap-8 mt-12 pt-4">
        <div className="text-center">
          <div className="border-b border-slate-400 mb-2 h-12"></div>
          <p className="text-xs font-medium text-slate-600">Prepared By</p>
        </div>
        <div className="text-center">
          <div className="border-b border-slate-400 mb-2 h-12"></div>
          <p className="text-xs font-medium text-slate-600">Checked By</p>
        </div>
        <div className="text-center">
          <div className="border-b border-slate-400 mb-2 h-12"></div>
          <p className="text-xs font-medium text-slate-600">Approved By</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-slate-300 text-center">
        <p className="text-sm font-medium text-slate-700 mb-1">Thank you for your business!</p>
        {company && (
          <p className="text-xs text-slate-500">
            {company.companyName}
            {company.phone && ` | ${company.phone}`}
            {company.email && ` | ${company.email}`}
          </p>
        )}
      </div>
    </div>
  );
}
