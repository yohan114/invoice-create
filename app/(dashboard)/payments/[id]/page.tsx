import { notFound } from "next/navigation";
import Link from "next/link";
import { getPaymentById } from "@/lib/actions/payments";
import { getCompanySettings } from "@/lib/actions/invoices";
import PaymentReceipt from "@/components/payment/PaymentReceipt";
import DeletePaymentButton from "../DeletePaymentButton";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [payment, settings] = await Promise.all([
    getPaymentById(id),
    getCompanySettings(),
  ]);

  if (!payment) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/payments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Payment Details</h1>
        </div>
        <DeletePaymentButton id={payment.id} />
      </div>

      <PaymentReceipt
        payment={payment}
        companyName={settings?.companyName || "Workshop Pro"}
        companyAddress={settings?.address || undefined}
        companyPhone={settings?.phone || undefined}
        companyEmail={settings?.email || undefined}
      />
    </div>
  );
}
