"use client";

import { useRouter } from "next/navigation";
import { deleteEquipment } from "@/lib/actions/equipment";
import Button from "@/components/ui/Button";

interface DeleteEquipmentButtonProps {
  id: string;
  name: string;
}

export default function DeleteEquipmentButton({ id, name }: DeleteEquipmentButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete equipment "${name}"? This action cannot be undone.`)) {
      return;
    }
    const result = await deleteEquipment(id);
    if (!result.success) {
      alert(result.error);
      return;
    }
    router.push("/equipment");
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete}>
      Delete
    </Button>
  );
}
