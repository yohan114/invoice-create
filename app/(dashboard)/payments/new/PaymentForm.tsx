"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPayment } from "@/lib/actions/payments";
import Button from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface OutstandingInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  grandTotal: number;
  totalPaid: number;
  balance: number;
}

interface PaymentFormProps {
  invoices: OutstandingInvoice[];
  preselectedInvoiceId: string;
}

export default function PaymentForm({ invoices, preselectedInvoiceId }: PaymentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [invoiceId, setInvoiceId] = useState(preselectedInvoiceId);
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const selectedInvoice = invoices.find((inv) => inv.id === invoiceId);
  const maxAmount = selectedInvoice?.balance || 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await createPayment({
      invoiceId,
      amount: parseFloat(amount) || 0,
      paymentDate,
      method,
      reference,
      notes,
    });

    if (result.success) {
      router.push("/payments");
    } else {
      setErrors(result.errors || {});
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Invoice <span className="text-red-500">*</span>
            </label>
            <select
              value={invoiceId}
              onChange={(e) => {
                setInvoiceId(e.target.value);
                setAmount("");
              }}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            >
              <option value="">Select an invoice...</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} - {inv.customerName} (Balance: Rs. {inv.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                </option>
              ))}
            </select>
            {errors.invoiceId && (
              <p className="mt-1 text-sm text-red-600">{errors.invoiceId[0]}</p>
            )}
          </div>

          {selectedInvoice && (
            <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <p>Grand Total: Rs. {selectedInvoice.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              <p>Paid: Rs. {selectedInvoice.totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              <p className="font-medium text-slate-900">
                Balance Remaining: Rs. {selectedInvoice.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Amount (Rs.) <span className="text-red-500">*</span>
              {maxAmount > 0 && (
                <span className="text-slate-500 font-normal ml-2">
                  Max: Rs. {maxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              )}
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={maxAmount || undefined}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              />
              {errors.paymentDate && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentDate[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="ONLINE">Online</option>
              </select>
              {errors.method && (
                <p className="mt-1 text-sm text-red-600">{errors.method[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reference #
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Transaction reference number"
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes..."
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" loading={loading}>
              Record Payment
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
