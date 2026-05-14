"use client";

import InvoicePrintView from "@/components/invoice/InvoicePrintView";
import { generateInvoicePDF } from "@/lib/pdf";
import { Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PrintPageClientProps {
  invoice: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string | null;
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
    poDate: string | null;
    deliveryDate: string | null;
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
    items: {
      id: string;
      type: string;
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }[];
    payments: {
      id: string;
      amount: number;
      paymentDate: string;
      method: string;
    }[];
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

export default function PrintPageClient({ invoice, company }: PrintPageClientProps) {
  function handlePrint() {
    window.print();
  }

  function handleDownloadPDF() {
    generateInvoicePDF(invoice, company);
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Action Bar - hidden when printing */}
      <div className="print:hidden bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link
          href={`/invoices`}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Print Content */}
      <div className="py-8 print:py-0">
        <InvoicePrintView invoice={invoice} company={company} />
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
