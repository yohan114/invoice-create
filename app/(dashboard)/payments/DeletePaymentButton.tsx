"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletePayment } from "@/lib/actions/payments";
import Button from "@/components/ui/Button";

export default function DeletePaymentButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this payment?")) return;
    setLoading(true);
    await deletePayment(id);
    router.push("/payments");
    router.refresh();
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete} loading={loading}>
      Delete
    </Button>
  );
}
