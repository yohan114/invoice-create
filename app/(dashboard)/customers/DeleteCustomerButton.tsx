"use client";

import { useRouter } from "next/navigation";
import { deleteCustomer } from "@/lib/actions/customers";
import Button from "@/components/ui/Button";

interface DeleteCustomerButtonProps {
  id: string;
  name: string;
}

export default function DeleteCustomerButton({ id, name }: DeleteCustomerButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${name}"? This will also delete related jobs and invoices.`)) {
      return;
    }
    await deleteCustomer(id);
    router.refresh();
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete}>
      Delete
    </Button>
  );
}
