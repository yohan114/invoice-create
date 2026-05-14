"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { createJob, updateJob } from "@/lib/actions/jobs";
import { getEquipmentForCustomer } from "@/lib/actions/equipment";

const jobFormSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  itemDescription: z.string().min(1, "Item/equipment description is required"),
  problemDescription: z.string().min(1, "Problem description is required"),
  technicianId: z.string(),
  equipmentId: z.string(),
  date: z.string(),
  notes: z.string(),
});

type JobFormValues = {
  customerId: string;
  itemDescription: string;
  problemDescription: string;
  technicianId: string;
  equipmentId: string;
  date: string;
  notes: string;
};

interface EquipmentOption {
  id: string;
  name: string;
  modelNumber: string | null;
  serialNumber: string | null;
}

interface JobFormProps {
  initialData?: {
    id: string;
    customerId: string;
    itemDescription: string;
    problemDescription: string;
    technicianId: string | null;
    equipmentId: string | null;
    date: string;
    notes: string | null;
  };
  customers: { id: string; name: string }[];
  technicians: { id: string; name: string }[];
  initialEquipment?: EquipmentOption[];
}

export default function JobForm({ initialData, customers, technicians, initialEquipment }: JobFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [equipmentList, setEquipmentList] = useState<EquipmentOption[]>(initialEquipment || []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm<JobFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(jobFormSchema) as any,
    defaultValues: {
      customerId: initialData?.customerId || "",
      itemDescription: initialData?.itemDescription || "",
      problemDescription: initialData?.problemDescription || "",
      technicianId: initialData?.technicianId || "",
      equipmentId: initialData?.equipmentId || "",
      date: initialData?.date || new Date().toISOString().split("T")[0],
      notes: initialData?.notes || "",
    },
  });

  const watchedCustomerId = watch("customerId");

  const loadEquipment = useCallback(async (custId: string) => {
    if (custId) {
      const equipment = await getEquipmentForCustomer(custId);
      setEquipmentList(equipment);
    } else {
      setEquipmentList([]);
      setValue("equipmentId", "");
    }
  }, [setValue]);

  async function onSubmit(data: JobFormValues) {
    const result = isEditing
      ? await updateJob(initialData.id, data)
      : await createJob(data);

    if (!result.success && result.errors) {
      const fieldErrors = result.errors as Record<string, string[]>;
      for (const [field, messages] of Object.entries(fieldErrors)) {
        setError(field as keyof JobFormValues, {
          message: messages[0],
        });
      }
      return;
    }

    router.push("/jobs");
  }

  const customerOptions = customers.map((c) => ({ value: c.id, label: c.name }));
  const technicianOptions = [
    { value: "", label: "Unassigned" },
    ...technicians.map((t) => ({ value: t.id, label: t.name })),
  ];
  const equipmentOptions = [
    { value: "", label: "None" },
    ...equipmentList.map((e) => ({
      value: e.id,
      label: `${e.name}${e.modelNumber ? ` (${e.modelNumber})` : ""}`,
    })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
        <select
          {...register("customerId")}
          onChange={(e) => {
            setValue("customerId", e.target.value);
            setValue("equipmentId", "");
            loadEquipment(e.target.value);
          }}
          className={`block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${errors.customerId ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
        >
          <option value="">Select a customer</option>
          {customerOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.customerId && (
          <p className="mt-1 text-sm text-red-600">{errors.customerId.message}</p>
        )}
      </div>

      <Select
        label="Equipment (optional)"
        {...register("equipmentId")}
        error={errors.equipmentId?.message}
        options={equipmentOptions}
        disabled={!watchedCustomerId || equipmentList.length === 0}
      />

      <div className="w-full">
        <label htmlFor="itemDescription" className="block text-sm font-medium text-slate-700 mb-1">
          Item/Equipment/Vehicle Description *
        </label>
        <textarea
          id="itemDescription"
          {...register("itemDescription")}
          rows={3}
          placeholder="Describe the item, equipment, or vehicle"
          className={`block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${errors.itemDescription ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
        />
        {errors.itemDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.itemDescription.message}</p>
        )}
      </div>

      <div className="w-full">
        <label htmlFor="problemDescription" className="block text-sm font-medium text-slate-700 mb-1">
          Problem Description *
        </label>
        <textarea
          id="problemDescription"
          {...register("problemDescription")}
          rows={3}
          placeholder="Describe the problem or issue"
          className={`block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none ${errors.problemDescription ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
        />
        {errors.problemDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.problemDescription.message}</p>
        )}
      </div>

      <Select
        label="Technician"
        {...register("technicianId")}
        error={errors.technicianId?.message}
        options={technicianOptions}
      />

      <Input
        label="Date"
        type="date"
        {...register("date")}
        error={errors.date?.message}
      />

      <div className="w-full">
        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          {...register("notes")}
          rows={3}
          placeholder="Additional notes (optional)"
          className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? "Update Job" : "Create Job"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
