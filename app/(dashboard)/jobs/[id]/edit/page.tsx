import { notFound } from "next/navigation";
import { getJobById, getCustomersForSelect, getTechniciansForSelect } from "@/lib/actions/jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import JobForm from "../../JobForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditJobPage({ params }: PageProps) {
  const { id } = await params;
  const [job, customers, technicians] = await Promise.all([
    getJobById(id),
    getCustomersForSelect(),
    getTechniciansForSelect(),
  ]);

  if (!job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Edit Job - {job.jobNumber}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <JobForm
            initialData={{
              id: job.id,
              customerId: job.customerId,
              itemDescription: job.itemDescription,
              problemDescription: job.problemDescription,
              technicianId: job.technicianId,
              date: new Date(job.date).toISOString().split("T")[0],
              notes: job.notes,
            }}
            customers={customers}
            technicians={technicians}
          />
        </CardContent>
      </Card>
    </div>
  );
}
