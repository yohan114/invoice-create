import { notFound } from "next/navigation";
import { getInvoiceById, getCustomersForSelect, getPartsForSelect, getCompanySettings, getJobsForCustomer } from "@/lib/actions/invoices";
import InvoiceForm from "../../InvoiceForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: PageProps) {
  const { id } = await params;
  const [invoice, customers, parts, settings] = await Promise.all([
    getInvoiceById(id),
    getCustomersForSelect(),
    getPartsForSelect(),
    getCompanySettings(),
  ]);

  if (!invoice) {
    notFound();
  }

  const initialJobs = await getJobsForCustomer(invoice.customerId);

  const initialData = {
    id: invoice.id,
    customerId: invoice.customerId,
    jobId: invoice.jobId,
    invoiceDate: new Date(invoice.invoiceDate).toISOString().split("T")[0],
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : "",
    items: invoice.items.map((item) => ({
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      partId: item.partId,
    })),
    discountPercent: invoice.discountPercent,
    taxPercent: invoice.taxPercent,
    ssclPercent: invoice.ssclPercent,
    invoiceType: invoice.invoiceType,
    poNumber: invoice.poNumber || "",
    poDate: invoice.poDate ? new Date(invoice.poDate).toISOString().split("T")[0] : "",
    deliveryDate: invoice.deliveryDate ? new Date(invoice.deliveryDate).toISOString().split("T")[0] : "",
    grnNumber: invoice.grnNumber || "",
    paymentTerms: invoice.paymentTerms || "",
    referenceNumber: invoice.referenceNumber || "",
    deliveryAddress: invoice.deliveryAddress || "",
    notes: invoice.notes || "",
    termsAndConditions: invoice.termsAndConditions || "",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Edit Invoice - {invoice.invoiceNumber}
      </h1>
      <InvoiceForm
        initialData={initialData}
        customers={customers}
        parts={parts}
        defaultTerms={settings?.termsAndConditions || ""}
        initialJobs={initialJobs}
      />
    </div>
  );
}
