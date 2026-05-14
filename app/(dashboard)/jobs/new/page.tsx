import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { getCustomersForSelect, getTechniciansForSelect } from "@/lib/actions/jobs";
import JobForm from "../JobForm";

export default async function NewJobPage() {
  const [customers, technicians] = await Promise.all([
    getCustomersForSelect(),
    getTechniciansForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Add Job</h1>
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm customers={customers} technicians={technicians} initialEquipment={[]} />
        </CardContent>
      </Card>
    </div>
  );
}
