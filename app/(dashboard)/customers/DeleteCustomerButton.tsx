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
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    const result = await deleteCustomer(id);
    if (!result.success) {
      alert(result.error || "Failed to delete customer");
      return;
    }
    router.refresh();
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete}>
      Delete
    </Button>
  );
}
