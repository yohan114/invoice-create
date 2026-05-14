import { notFound } from "next/navigation";
import { getPartById } from "@/lib/actions/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import PartForm from "../../PartForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPartPage({ params }: PageProps) {
  const { id } = await params;
  const part = await getPartById(id);

  if (!part) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Edit Part</h1>
      <Card>
        <CardHeader>
          <CardTitle>Part Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PartForm
            initialData={{
              id: part.id,
              name: part.name,
              description: part.description,
              quantity: part.quantity,
              unitPrice: part.unitPrice,
              costPrice: part.costPrice,
              supplier: part.supplier,
              reorderLevel: part.reorderLevel,
              unit: part.unit,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
