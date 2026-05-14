import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import PartForm from "../PartForm";

export default function NewPartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Add Part</h1>
      <Card>
        <CardHeader>
          <CardTitle>Part Details</CardTitle>
        </CardHeader>
        <CardContent>
          <PartForm />
        </CardContent>
      </Card>
    </div>
  );
}
