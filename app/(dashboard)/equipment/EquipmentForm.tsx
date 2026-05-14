"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { createEquipment, updateEquipment } from "@/lib/actions/equipment";

const equipmentFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  name: z.string().min(1, "Name is required"),
  modelNumber: z.string(),
  serialNumber: z.string(),
  registrationNumber: z.string(),
  description: z.string(),
});

type EquipmentFormValues = {
  customerId: string;
  name: string;
  modelNumber: string;
  serialNumber: string;
  registrationNumber: string;
  description: string;
};

interface EquipmentFormProps {
  initialData?: {
    id: string;
    customerId: string;
    name: string;
    modelNumber: string | null;
    serialNumber: string | null;
    registrationNumber: string | null;
    description: string | null;
  };
  customers: { id: string; name: string }[];
}

export default function EquipmentForm({ initialData, customers }: EquipmentFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<EquipmentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(equipmentFormSchema) as any,
    defaultValues: {
      customerId: initialData?.customerId || "",
      name: initialData?.name || "",
      modelNumber: initialData?.modelNumber || "",
      serialNumber: initialData?.serialNumber || "",
      registrationNumber: initialData?.registrationNumber || "",
      description: initialData?.description || "",
    },
  });

  async function onSubmit(data: EquipmentFormValues) {
    const result = isEditing
      ? await updateEquipment(initialData.id, data)
      : await createEquipment(data);

    if (!result.success && "errors" in result) {
      const fieldErrors = result.errors as Record<string, string[]>;
      for (const [field, messages] of Object.entries(fieldErrors)) {
        setError(field as keyof EquipmentFormValues, {
          message: messages[0],
        });
      }
      return;
    }

    router.push("/equipment");
  }

  const customerOptions = customers.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <Select
        label="Customer *"
        {...register("customerId")}
        error={errors.customerId?.message}
        options={customerOptions}
        placeholder="Select a customer"
      />

      <Input
        label="Name *"
        {...register("name")}
        error={errors.name?.message}
        placeholder="Equipment name"
      />

      <Input
        label="Model Number"
        {...register("modelNumber")}
        error={errors.modelNumber?.message}
        placeholder="Model number"
      />

      <Input
        label="Serial Number"
        {...register("serialNumber")}
        error={errors.serialNumber?.message}
        placeholder="Serial number"
      />

      <Input
        label="Registration Number"
        {...register("registrationNumber")}
        error={errors.registrationNumber?.message}
        placeholder="Registration number"
      />

      <div className="w-full">
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={3}
          placeholder="Equipment description (optional)"
          className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? "Update Equipment" : "Create Equipment"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
