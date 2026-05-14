"use client";

import { useRouter } from "next/navigation";
import { convertToTaxInvoice } from "@/lib/actions/invoices";
import Button from "@/components/ui/Button";

interface ConvertToTaxInvoiceButtonProps {
  id: string;
}

export default function ConvertToTaxInvoiceButton({ id }: ConvertToTaxInvoiceButtonProps) {
  const router = useRouter();

  async function handleConvert() {
    if (!confirm("Are you sure you want to convert this proforma invoice to a tax invoice? This action cannot be undone.")) {
      return;
    }
    const result = await convertToTaxInvoice(id);
    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to convert invoice");
    }
  }

  return (
    <Button variant="secondary" onClick={handleConvert}>
      Convert to Tax Invoice
    </Button>
  );
}
