"use client";

import { useRouter } from "next/navigation";
import { deletePart } from "@/lib/actions/inventory";
import Button from "@/components/ui/Button";

interface DeletePartButtonProps {
  id: string;
  name: string;
}

export default function DeletePartButton({ id, name }: DeletePartButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    await deletePart(id);
    router.refresh();
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete}>
      Delete
    </Button>
  );
}
