import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/actions/customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import CustomerForm from "../../CustomerForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({ params }: PageProps) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Edit Customer</h1>
      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomerForm
            initialData={{
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              address: customer.address,
              taxNumber: customer.taxNumber,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
