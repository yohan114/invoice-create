import { getOutstandingInvoices } from "@/lib/actions/payments";
import PaymentForm from "./PaymentForm";

interface PageProps {
  searchParams: Promise<{ invoiceId?: string }>;
}

export default async function NewPaymentPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const invoices = await getOutstandingInvoices();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Record Payment</h1>
      <PaymentForm invoices={invoices} preselectedInvoiceId={params.invoiceId || ""} />
    </div>
  );
}
