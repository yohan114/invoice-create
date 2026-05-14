"use client";

import { useRouter } from "next/navigation";
import { deleteJob } from "@/lib/actions/jobs";
import Button from "@/components/ui/Button";

interface DeleteJobButtonProps {
  id: string;
  jobNumber: string;
}

export default function DeleteJobButton({ id, jobNumber }: DeleteJobButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete job "${jobNumber}"? This action cannot be undone.`)) {
      return;
    }
    await deleteJob(id);
    router.push("/jobs");
  }

  return (
    <Button variant="danger" size="sm" onClick={handleDelete}>
      Delete
    </Button>
  );
}
