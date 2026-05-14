import { notFound } from "next/navigation";
import { getEquipmentById, getCustomersForSelect } from "@/lib/actions/equipment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import EquipmentForm from "../../EquipmentForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEquipmentPage({ params }: PageProps) {
  const { id } = await params;
  const [equipment, customers] = await Promise.all([
    getEquipmentById(id),
    getCustomersForSelect(),
  ]);

  if (!equipment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Edit Equipment - {equipment.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentForm
            initialData={{
              id: equipment.id,
              customerId: equipment.customerId,
              name: equipment.name,
              modelNumber: equipment.modelNumber,
              serialNumber: equipment.serialNumber,
              registrationNumber: equipment.registrationNumber,
              description: equipment.description,
            }}
            customers={customers}
          />
        </CardContent>
      </Card>
    </div>
  );
}
