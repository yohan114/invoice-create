"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { deleteInvoice } from "@/lib/actions/invoices";

interface DeleteInvoiceButtonProps {
  id: string;
  invoiceNumber: string;
}

export default function DeleteInvoiceButton({ id, invoiceNumber }: DeleteInvoiceButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteInvoice(id);
    router.push("/invoices");
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600">Delete {invoiceNumber}?</span>
        <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>
          Confirm
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button variant="danger" onClick={() => setConfirming(true)}>
      Delete
    </Button>
  );
}
