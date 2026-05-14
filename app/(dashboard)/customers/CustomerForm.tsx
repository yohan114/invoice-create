"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createCustomer, updateCustomer } from "@/lib/actions/customers";

const customerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string(),
  email: z.string().email("Invalid email").or(z.literal("")),
  address: z.string(),
  taxNumber: z.string(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  initialData?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    taxNumber: string | null;
  };
}

export default function CustomerForm({ initialData }: CustomerFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      taxNumber: initialData?.taxNumber || "",
    },
  });

  async function onSubmit(data: CustomerFormValues) {
    const result = isEditing
      ? await updateCustomer(initialData.id, data)
      : await createCustomer(data);

    if (!result.success && result.errors) {
      const fieldErrors = result.errors as Record<string, string[]>;
      for (const [field, messages] of Object.entries(fieldErrors)) {
        setError(field as keyof CustomerFormValues, {
          message: messages[0],
        });
      }
      return;
    }

    router.push("/customers");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <Input
        label="Name *"
        {...register("name")}
        error={errors.name?.message}
        placeholder="Customer name"
      />
      <Input
        label="Phone"
        {...register("phone")}
        error={errors.phone?.message}
        placeholder="Phone number"
      />
      <Input
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
        placeholder="Email address"
      />
      <Input
        label="Address"
        {...register("address")}
        error={errors.address?.message}
        placeholder="Address"
      />
      <Input
        label="Tax/VAT Number"
        {...register("taxNumber")}
        error={errors.taxNumber?.message}
        placeholder="Tax/VAT number"
      />
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? "Update Customer" : "Create Customer"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
