"use client";

import { Phone, Globe, Mail, MapPin, Printer } from "lucide-react";

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

interface InvoicePrintViewProps {
  invoice: {
    invoiceNumber: string;
    invoiceDate: Date | string;
    dueDate: Date | string | null;
    invoiceType: string;
    status: string;
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    ssclPercent: number;
    ssclAmount: number;
    taxPercent: number;
    taxAmount: number;
    grandTotal: number;
    notes: string | null;
    termsAndConditions: string | null;
    poNumber: string | null;
    poDate: Date | string | null;
    deliveryDate: Date | string | null;
    grnNumber: string | null;
    paymentTerms: string | null;
    referenceNumber: string | null;
    deliveryAddress: string | null;
    customer: {
      name: string;
      address: string | null;
      phone: string | null;
      email: string | null;
      taxNumber: string | null;
    };
    job: { jobNumber: string; itemDescription: string } | null;
    items: InvoiceItem[];
    payments: Payment[];
  };
  company: {
    companyName: string;
    companySubtitle: string | null;
    logo: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    taxNumber: string | null;
    website: string | null;
    faxNumber: string | null;
    footerDetails: string | null;
  } | null;
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function groupItemsByType(items: InvoiceItem[]) {
  const groups: { label: string; items: InvoiceItem[] }[] = [];

  const partItems = items.filter((i) => i.type === "PART");
  const serviceItems = items.filter((i) => i.type === "SERVICE");
  const labourItems = items.filter((i) => i.type === "LABOUR");
  const otherItems = items.filter(
    (i) =>
      i.type === "TECHNICAL_CHARGE" ||
      i.type === "TRANSPORT" ||
      i.type === "SUNDRY"
  );

  if (partItems.length > 0) {
    groups.push({ label: "Parts", items: partItems });
  }
  if (serviceItems.length > 0) {
    groups.push({ label: "Services", items: serviceItems });
  }
  if (labourItems.length > 0) {
    groups.push({ label: "Labour", items: labourItems });
  }
  if (otherItems.length > 0) {
    groups.push({ label: "Technical Charges & Other", items: otherItems });
  }

  return groups;
}

export default function InvoicePrintView({
  invoice,
  company,
}: InvoicePrintViewProps) {
  const groups = groupItemsByType(invoice.items);
  const invoiceTitle =
    invoice.invoiceType === "TAX_INVOICE"
      ? "TAX INVOICE"
      : "PROFORMA INVOICE";

  return (
    <div className="bg-white max-w-[210mm] mx-auto text-slate-900 text-sm print:p-0 p-8">
      {/* HEADER: Logos left/right, company name centered */}
      <div className="flex items-center justify-between mb-2 pb-2">
        <div className="flex-shrink-0 w-20">
          {company?.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo}
              alt="Logo"
              className="h-14 w-auto object-contain"
            />
          )}
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-xl font-bold uppercase tracking-wide">
            {company?.companyName || "Company Name"}
          </h1>
          {company?.companySubtitle && (
            <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
              {company.companySubtitle}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 w-20 flex justify-end">
          {company?.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo}
              alt="Logo"
              className="h-14 w-auto object-contain"
            />
          )}
        </div>
      </div>

      {/* TITLE: Invoice type in bordered box */}
      <div className="border-2 border-slate-800 py-2 px-4 text-center mb-4">
        <h2 className="text-lg font-bold uppercase tracking-wide">
          {invoiceTitle}
        </h2>
      </div>

      {/* INVOICE DETAILS BOX: Right-aligned */}
      <div className="flex justify-end mb-4">
        <table className="border border-slate-400 text-xs">
          <tbody>
            <tr>
              <td className="border border-slate-400 px-3 py-1 font-medium bg-slate-50">
                PI No.
              </td>
              <td className="border border-slate-400 px-3 py-1 font-bold">
                {invoice.invoiceNumber}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-400 px-3 py-1 font-medium bg-slate-50">
                Date
              </td>
              <td className="border border-slate-400 px-3 py-1">
                {formatDate(invoice.invoiceDate)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CUSTOMER BOXES: Two equal-width bordered boxes side by side */}
      <div className="grid grid-cols-2 gap-0 mb-4">
        {/* Invoice To */}
        <div className="border border-slate-400 p-3">
          <h3 className="font-bold text-xs uppercase tracking-wide mb-2 border-b border-slate-300 pb-1">
            Invoice To
          </h3>
          <p className="font-bold text-sm">{invoice.customer.name}</p>
          {invoice.customer.address && (
            <p className="text-xs text-slate-700 whitespace-pre-line mt-1">
              {invoice.customer.address}
            </p>
          )}
          {invoice.customer.taxNumber && (
            <p className="text-xs text-slate-700 mt-1">
              <span className="font-medium">VAT No:</span>{" "}
              {invoice.customer.taxNumber}
            </p>
          )}
        </div>

        {/* Delivered To */}
        <div className="border border-slate-400 border-l-0 p-3">
          <h3 className="font-bold text-xs uppercase tracking-wide mb-2 border-b border-slate-300 pb-1">
            Delivered To
          </h3>
          <p className="font-bold text-sm">{invoice.customer.name}</p>
          <p className="text-xs text-slate-700 whitespace-pre-line mt-1">
            {invoice.deliveryAddress || invoice.customer.address || ""}
          </p>
          {invoice.customer.taxNumber && (
            <p className="text-xs text-slate-700 mt-1">
              <span className="font-medium">VAT No:</span>{" "}
              {invoice.customer.taxNumber}
            </p>
          )}
        </div>
      </div>

      {/* ADDITIONAL DETAILS ROW */}
      <table className="w-full border-collapse border border-slate-400 mb-4 text-xs">
        <thead>
          <tr className="bg-slate-50">
            <th className="border border-slate-400 px-2 py-1 font-medium text-left">
              P.O. No.
            </th>
            <th className="border border-slate-400 px-2 py-1 font-medium text-left">
              PO Date
            </th>
            <th className="border border-slate-400 px-2 py-1 font-medium text-left">
              Term
            </th>
            <th className="border border-slate-400 px-2 py-1 font-medium text-left">
              Delivery Date
            </th>
            <th className="border border-slate-400 px-2 py-1 font-medium text-left">
              GRN No.
            </th>
            <th className="border border-slate-400 px-2 py-1 font-medium text-left">
              PI No.
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-400 px-2 py-1">
              {invoice.poNumber || "-"}
            </td>
            <td className="border border-slate-400 px-2 py-1">
              {formatDate(invoice.poDate) || "-"}
            </td>
            <td className="border border-slate-400 px-2 py-1">
              {invoice.paymentTerms || "-"}
            </td>
            <td className="border border-slate-400 px-2 py-1">
              {formatDate(invoice.deliveryDate) || "-"}
            </td>
            <td className="border border-slate-400 px-2 py-1">
              {invoice.grnNumber || "-"}
            </td>
            <td className="border border-slate-400 px-2 py-1">
              {invoice.referenceNumber || invoice.invoiceNumber}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ITEM TABLE */}
      <table className="w-full border-collapse border border-slate-400 mb-4 text-xs">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="border border-slate-600 px-3 py-2 text-left font-medium">
              Description
            </th>
            <th className="border border-slate-600 px-3 py-2 text-center font-medium w-16">
              Units
            </th>
            <th className="border border-slate-600 px-3 py-2 text-right font-medium w-24">
              Rate
            </th>
            <th className="border border-slate-600 px-3 py-2 text-right font-medium w-28">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <GroupRows key={group.label} group={group} />
          ))}
          {/* Empty rows for spacing if few items */}
          {invoice.items.length < 5 &&
            Array.from({ length: 5 - invoice.items.length }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-slate-300 px-3 py-2">&nbsp;</td>
                <td className="border border-slate-300 px-3 py-2">&nbsp;</td>
                <td className="border border-slate-300 px-3 py-2">&nbsp;</td>
                <td className="border border-slate-300 px-3 py-2">&nbsp;</td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* TOTALS BOX: Right-aligned */}
      <div className="flex justify-end mb-6">
        <table className="border border-slate-400 text-xs w-64">
          <tbody>
            {invoice.ssclPercent > 0 && (
              <tr>
                <td className="border border-slate-400 px-3 py-1 font-medium">
                  SSCL {invoice.ssclPercent}%
                </td>
                <td className="border border-slate-400 px-3 py-1 text-right">
                  {formatCurrency(invoice.ssclAmount)}
                </td>
              </tr>
            )}
            <tr>
              <td className="border border-slate-400 px-3 py-1 font-medium">
                Sub Total
              </td>
              <td className="border border-slate-400 px-3 py-1 text-right">
                {formatCurrency(invoice.subtotal)}
              </td>
            </tr>
            {invoice.discountPercent > 0 && (
              <tr>
                <td className="border border-slate-400 px-3 py-1 font-medium">
                  Discount ({invoice.discountPercent}%)
                </td>
                <td className="border border-slate-400 px-3 py-1 text-right text-red-600">
                  - {formatCurrency(invoice.discountAmount)}
                </td>
              </tr>
            )}
            {invoice.taxPercent > 0 && (
              <tr>
                <td className="border border-slate-400 px-3 py-1 font-medium">
                  VAT ({invoice.taxPercent}%)
                </td>
                <td className="border border-slate-400 px-3 py-1 text-right">
                  {formatCurrency(invoice.taxAmount)}
                </td>
              </tr>
            )}
            <tr className="bg-slate-100">
              <td className="border border-slate-400 px-3 py-2 font-bold">
                Grand Total
              </td>
              <td className="border border-slate-400 px-3 py-2 text-right font-bold">
                {formatCurrency(invoice.grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-4 text-xs">
          <p className="font-medium text-slate-600">Notes:</p>
          <p className="text-slate-700 whitespace-pre-line">{invoice.notes}</p>
        </div>
      )}

      {/* Terms & Conditions */}
      {invoice.termsAndConditions && (
        <div className="mb-4 text-xs">
          <p className="font-medium text-slate-600">Terms & Conditions:</p>
          <p className="text-slate-700 whitespace-pre-line">
            {invoice.termsAndConditions}
          </p>
        </div>
      )}

      {/* SIGNATURE SECTION */}
      <div className="grid grid-cols-3 gap-8 mt-10 mb-8">
        <div className="text-center">
          <div className="h-16"></div>
          <div className="border-t border-slate-800 pt-1">
            <p className="text-xs font-medium text-slate-700">Prepared By</p>
          </div>
        </div>
        <div className="text-center">
          <div className="h-16"></div>
          <div className="border-t border-slate-800 pt-1">
            <p className="text-xs font-medium text-slate-700">Checked By</p>
          </div>
        </div>
        <div className="text-center">
          <div className="h-16"></div>
          <div className="border-t border-slate-800 pt-1">
            <p className="text-xs font-medium text-slate-700">Approved By</p>
          </div>
        </div>
      </div>

      {/* FOOTER CONTACT BAR */}
      {company && (
        <div className="bg-slate-800 text-white px-4 py-3 text-xs flex flex-wrap items-center justify-center gap-4 print:fixed print:bottom-0 print:left-0 print:right-0">
          {company.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {company.phone}
            </span>
          )}
          {company.faxNumber && (
            <span className="inline-flex items-center gap-1">
              <Printer className="h-3 w-3" />
              {company.faxNumber}
            </span>
          )}
          {company.website && (
            <span className="inline-flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {company.website}
            </span>
          )}
          {company.email && (
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {company.email}
            </span>
          )}
          {company.address && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {company.address}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function GroupRows({ group }: { group: { label: string; items: InvoiceItem[] } }) {
  return (
    <>
      {/* Section header row */}
      <tr className="bg-slate-100">
        <td
          colSpan={4}
          className="border border-slate-300 px-3 py-1.5 font-bold text-slate-800"
        >
          {group.label}
        </td>
      </tr>
      {/* Item rows */}
      {group.items.map((item) => (
        <tr key={item.id}>
          <td className="border border-slate-300 px-3 py-1.5">
            {item.description}
          </td>
          <td className="border border-slate-300 px-3 py-1.5 text-center">
            {item.quantity}
          </td>
          <td className="border border-slate-300 px-3 py-1.5 text-right">
            {item.unitPrice.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </td>
          <td className="border border-slate-300 px-3 py-1.5 text-right font-medium">
            {item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </td>
        </tr>
      ))}
    </>
  );
}
