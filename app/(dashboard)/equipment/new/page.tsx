import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getCustomersForSelect } from "@/lib/actions/equipment";
import EquipmentForm from "../EquipmentForm";

export default async function NewEquipmentPage() {
  const customers = await getCustomersForSelect();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Add Equipment</h1>
      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentForm customers={customers} />
        </CardContent>
      </Card>
    </div>
  );
}
