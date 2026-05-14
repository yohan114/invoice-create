"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { createPart, updatePart } from "@/lib/actions/inventory";

const partFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  quantity: z.coerce.number().int().min(0, "Quantity must be 0 or more"),
  unitPrice: z.coerce.number().min(0, "Unit price must be 0 or more"),
  costPrice: z.coerce.number().min(0, "Cost price must be 0 or more"),
  supplier: z.string(),
  reorderLevel: z.coerce.number().int().min(0),
  unit: z.string(),
});

type PartFormValues = {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  supplier: string;
  reorderLevel: number;
  unit: string;
};

interface PartFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    supplier: string | null;
    reorderLevel: number;
    unit: string;
  };
}

const unitOptions = [
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "ltr", label: "Litres (ltr)" },
  { value: "m", label: "Metres (m)" },
  { value: "set", label: "Set" },
];

export default function PartForm({ initialData }: PartFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PartFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(partFormSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      quantity: initialData?.quantity ?? 0,
      unitPrice: initialData?.unitPrice ?? 0,
      costPrice: initialData?.costPrice ?? 0,
      supplier: initialData?.supplier || "",
      reorderLevel: initialData?.reorderLevel ?? 5,
      unit: initialData?.unit || "pcs",
    },
  });

  async function onSubmit(data: PartFormValues) {
    const result = isEditing
      ? await updatePart(initialData.id, data)
      : await createPart(data);

    if (!result.success && result.errors) {
      const fieldErrors = result.errors as Record<string, string[]>;
      for (const [field, messages] of Object.entries(fieldErrors)) {
        setError(field as keyof PartFormValues, {
          message: messages[0],
        });
      }
      return;
    }

    router.push("/inventory");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <Input
        label="Name *"
        {...register("name")}
        error={errors.name?.message}
        placeholder="Part name"
      />
      <Input
        label="Description"
        {...register("description")}
        error={errors.description?.message}
        placeholder="Part description"
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Quantity"
          type="number"
          {...register("quantity")}
          error={errors.quantity?.message}
          placeholder="0"
        />
        <Select
          label="Unit"
          {...register("unit")}
          error={errors.unit?.message}
          options={unitOptions}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Unit Price (Rs.)"
          type="number"
          step="0.01"
          {...register("unitPrice")}
          error={errors.unitPrice?.message}
          placeholder="0.00"
        />
        <Input
          label="Cost Price (Rs.)"
          type="number"
          step="0.01"
          {...register("costPrice")}
          error={errors.costPrice?.message}
          placeholder="0.00"
        />
      </div>
      <Input
        label="Supplier"
        {...register("supplier")}
        error={errors.supplier?.message}
        placeholder="Supplier name"
      />
      <Input
        label="Reorder Level"
        type="number"
        {...register("reorderLevel")}
        error={errors.reorderLevel?.message}
        placeholder="5"
      />
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? "Update Part" : "Create Part"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
