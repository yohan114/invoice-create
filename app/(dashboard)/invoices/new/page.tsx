import { getCustomersForSelect, getPartsForSelect, getCompanySettings } from "@/lib/actions/invoices";
import InvoiceForm from "../InvoiceForm";

export default async function NewInvoicePage() {
  const [customers, parts, settings] = await Promise.all([
    getCustomersForSelect(),
    getPartsForSelect(),
    getCompanySettings(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Create Invoice</h1>
      <InvoiceForm
        customers={customers}
        parts={parts}
        defaultTerms={settings?.termsAndConditions || ""}
      />
    </div>
  );
}
