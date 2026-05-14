"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateJobStatus } from "@/lib/actions/jobs";
import Button from "@/components/ui/Button";

interface StatusActionsProps {
  jobId: string;
  currentStatus: string;
}

const TRANSITION_LABELS: Record<string, { label: string; variant: "primary" | "secondary" | "danger" }> = {
  IN_PROGRESS: { label: "Start Work", variant: "primary" },
  COMPLETED: { label: "Mark Complete", variant: "primary" },
  DELIVERED: { label: "Mark Delivered", variant: "primary" },
  CANCELLED: { label: "Cancel Job", variant: "danger" },
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export default function StatusActions({ jobId, currentStatus }: StatusActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  if (allowedTransitions.length === 0) {
    return null;
  }

  async function handleStatusChange(newStatus: string) {
    const label = TRANSITION_LABELS[newStatus]?.label || newStatus;
    if (!confirm(`Are you sure you want to "${label}" this job?`)) {
      return;
    }

    setLoading(newStatus);
    setError(null);

    const result = await updateJobStatus(jobId, newStatus);
    if (!result.success) {
      setError(result.error || "Failed to update status");
      setLoading(null);
      return;
    }

    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {allowedTransitions.map((status) => {
          const config = TRANSITION_LABELS[status];
          return (
            <Button
              key={status}
              variant={config?.variant || "primary"}
              size="sm"
              loading={loading === status}
              disabled={loading !== null}
              onClick={() => handleStatusChange(status)}
            >
              {config?.label || status}
            </Button>
          );
        })}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
