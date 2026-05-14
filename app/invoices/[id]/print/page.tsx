import { notFound } from "next/navigation";
import { getInvoiceById, getCompanySettings } from "@/lib/actions/invoices";
import PrintPageClient from "./PrintPageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoicePrintPage({ params }: PageProps) {
  const { id } = await params;
  const [invoice, settings] = await Promise.all([
    getInvoiceById(id),
    getCompanySettings(),
  ]);

  if (!invoice) {
    notFound();
  }

  const company = settings
    ? {
        companyName: settings.companyName,
        logo: settings.logo,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        taxNumber: settings.taxNumber,
      }
    : null;

  const invoiceData = {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate.toISOString(),
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
    status: invoice.status,
    subtotal: invoice.subtotal,
    discountPercent: invoice.discountPercent,
    discountAmount: invoice.discountAmount,
    taxPercent: invoice.taxPercent,
    taxAmount: invoice.taxAmount,
    grandTotal: invoice.grandTotal,
    notes: invoice.notes,
    termsAndConditions: invoice.termsAndConditions,
    customer: {
      name: invoice.customer.name,
      address: invoice.customer.address,
      phone: invoice.customer.phone,
      email: invoice.customer.email,
      taxNumber: invoice.customer.taxNumber,
    },
    job: invoice.job
      ? { jobNumber: invoice.job.jobNumber, itemDescription: invoice.job.itemDescription }
      : null,
    items: invoice.items.map((item) => ({
      id: item.id,
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    })),
    payments: invoice.payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      paymentDate: p.paymentDate.toISOString(),
      method: p.method,
    })),
  };

  return <PrintPageClient invoice={invoiceData} company={company} />;
}
