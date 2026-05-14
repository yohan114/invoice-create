import Link from "next/link";
import { notFound } from "next/navigation";
import { getEquipmentById } from "@/lib/actions/equipment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DeleteEquipmentButton from "../DeleteEquipmentButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getStatusVariant(status: string) {
  switch (status) {
    case "PENDING":
      return "warning";
    case "IN_PROGRESS":
      return "info";
    case "COMPLETED":
      return "success";
    case "DELIVERED":
      return "default";
    case "CANCELLED":
      return "danger";
    default:
      return "default";
  }
}

export default async function EquipmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const equipment = await getEquipmentById(id);

  if (!equipment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{equipment.name}</h1>
        <div className="flex items-center gap-2">
          <Link href={`/equipment/${equipment.id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <DeleteEquipmentButton id={equipment.id} name={equipment.name} />
        </div>
      </div>

      {/* Equipment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500">Customer</dt>
              <dd className="mt-1 text-sm text-slate-900">
                <Link href={`/customers/${equipment.customer.id}`} className="text-blue-600 hover:underline">
                  {equipment.customer.name}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Model Number</dt>
              <dd className="mt-1 text-sm text-slate-900">{equipment.modelNumber || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Serial Number</dt>
              <dd className="mt-1 text-sm text-slate-900">{equipment.serialNumber || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Registration Number</dt>
              <dd className="mt-1 text-sm text-slate-900">{equipment.registrationNumber || "-"}</dd>
            </div>
            {equipment.description && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Description</dt>
                <dd className="mt-1 text-sm text-slate-900">{equipment.description}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Linked Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Linked Jobs</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Job Number</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Description</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {equipment.jobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No jobs linked to this equipment
                  </td>
                </tr>
              ) : (
                equipment.jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:underline">
                        {job.jobNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{job.itemDescription}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(job.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusVariant(job.status)}>
                        {job.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
