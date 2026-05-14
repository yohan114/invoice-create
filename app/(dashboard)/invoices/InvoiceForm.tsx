"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createInvoice, updateInvoice, getJobsForCustomer } from "@/lib/actions/invoices";
import { Trash2, Plus } from "lucide-react";

const ITEM_TYPES = [
  { value: "PART", label: "Part" },
  { value: "LABOUR", label: "Labour" },
  { value: "SERVICE", label: "Service" },
  { value: "TECHNICAL_CHARGE", label: "Technical Charge" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "SUNDRY", label: "Sundry" },
];

interface LineItem {
  type: string;
  description: string;
  quantity: number;
  unitPrice: number;
  partId: string;
}

interface PartOption {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

interface CustomerOption {
  id: string;
  name: string;
}

interface JobOption {
  id: string;
  jobNumber: string;
  itemDescription: string;
}

interface InvoiceFormProps {
  initialData?: {
    id: string;
    customerId: string;
    jobId: string | null;
    invoiceDate: string;
    dueDate: string;
    items: {
      type: string;
      description: string;
      quantity: number;
      unitPrice: number;
      partId: string | null;
    }[];
    discountPercent: number;
    taxPercent: number;
    notes: string;
    termsAndConditions: string;
  };
  customers: CustomerOption[];
  parts: PartOption[];
  defaultTerms: string;
  initialJobs?: JobOption[];
}

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export default function InvoiceForm({ initialData, customers, parts, defaultTerms, initialJobs }: InvoiceFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [customerId, setCustomerId] = useState(initialData?.customerId || "");
  const [jobId, setJobId] = useState(initialData?.jobId || "");
  const [invoiceDate, setInvoiceDate] = useState(
    initialData?.invoiceDate || new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [items, setItems] = useState<LineItem[]>(
    initialData?.items.map((item) => ({
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      partId: item.partId || "",
    })) || [{ type: "PART", description: "", quantity: 1, unitPrice: 0, partId: "" }]
  );
  const [discountPercent, setDiscountPercent] = useState(initialData?.discountPercent || 0);
  const [taxPercent, setTaxPercent] = useState(initialData?.taxPercent || 0);
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [termsAndConditions, setTermsAndConditions] = useState(
    initialData?.termsAndConditions || defaultTerms
  );
  const [jobs, setJobs] = useState<JobOption[]>(initialJobs || []);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const loadJobs = useCallback(async (custId: string) => {
    if (custId) {
      const customerJobs = await getJobsForCustomer(custId);
      setJobs(customerJobs);
    } else {
      setJobs([]);
      setJobId("");
    }
  }, []);

  function addItem() {
    setItems([...items, { type: "PART", description: "", quantity: 1, unitPrice: 0, partId: "" }]);
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  }

  function handlePartSelect(index: number, partId: string) {
    const part = parts.find((p) => p.id === partId);
    if (part) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        partId,
        description: part.name,
        unitPrice: part.unitPrice,
      };
      setItems(newItems);
    } else {
      updateItem(index, "partId", "");
    }
  }

  function handleTypeChange(index: number, type: string) {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      type,
      partId: "",
      description: type !== "PART" ? newItems[index].description : "",
      unitPrice: type !== "PART" ? newItems[index].unitPrice : 0,
    };
    setItems(newItems);
  }

  // Calculations
  const subtotal = round2(items.reduce((sum, item) => sum + round2(item.quantity * item.unitPrice), 0));
  const discountAmount = round2(subtotal * discountPercent / 100);
  const taxableAmount = round2(subtotal - discountAmount);
  const taxAmount = round2(taxableAmount * taxPercent / 100);
  const grandTotal = round2(taxableAmount + taxAmount);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const data = {
      customerId,
      jobId,
      invoiceDate,
      dueDate,
      items: items.map((item) => ({
        type: item.type,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        partId: item.partId,
      })),
      discountPercent: Number(discountPercent),
      taxPercent: Number(taxPercent),
      notes,
      termsAndConditions,
    };

    const result = isEditing
      ? await updateInvoice(initialData.id, data)
      : await createInvoice(data);

    if (!result.success && "errors" in result) {
      setErrors(result.errors as Record<string, string[]>);
      setSubmitting(false);
      return;
    }

    if (result.success && "invoice" in result) {
      router.push(`/invoices/${result.invoice.id}`);
    } else {
      router.push("/invoices");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Customer and Job Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
          <select
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setJobId("");
              loadJobs(e.target.value);
            }}
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select a customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.customerId && <p className="mt-1 text-sm text-red-600">{errors.customerId[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job (optional)</label>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            disabled={!customerId || jobs.length === 0}
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="">No job linked</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.jobNumber} - {j.itemDescription}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Invoice Date *"
          type="date"
          value={invoiceDate}
          onChange={(e) => setInvoiceDate(e.target.value)}
          error={errors.invoiceDate?.[0]}
        />
        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {/* Line Items */}
      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-3">Line Items</h3>
        {errors.items && <p className="mb-2 text-sm text-red-600">{errors.items[0]}</p>}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600 w-32">Type</th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">Description</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600 w-20">Qty</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600 w-28">Unit Price</th>
                <th className="px-3 py-2 text-right font-medium text-slate-600 w-28">Amount</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {items.map((item, index) => {
                const amount = round2(item.quantity * item.unitPrice);
                const selectedPart = item.type === "PART" && item.partId
                  ? parts.find((p) => p.id === item.partId)
                  : null;

                return (
                  <tr key={index} className="align-top">
                    <td className="px-3 py-2">
                      <select
                        value={item.type}
                        onChange={(e) => handleTypeChange(index, e.target.value)}
                        className="block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        {ITEM_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      {item.type === "PART" ? (
                        <div className="space-y-1">
                          <select
                            value={item.partId}
                            onChange={(e) => handlePartSelect(index, e.target.value)}
                            className="block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          >
                            <option value="">Select a part</option>
                            {parts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (Stock: {p.quantity})
                              </option>
                            ))}
                          </select>
                          {selectedPart && selectedPart.quantity < item.quantity && (
                            <p className="text-xs text-amber-600">
                              Warning: Only {selectedPart.quantity} in stock
                            </p>
                          )}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                          placeholder="Description"
                          className="block w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                        className="block w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="block w-full rounded border border-slate-300 px-2 py-1.5 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-900">
                      {amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* Calculations */}
      <div className="flex justify-end">
        <div className="w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">Rs. {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Discount</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                className="w-16 rounded border border-slate-300 px-2 py-1 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-slate-500">%</span>
            </div>
            <span className="font-medium text-red-600">
              - Rs. {discountAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Taxable Amount</span>
            <span className="font-medium">Rs. {taxableAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Tax/VAT</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-16 rounded border border-slate-300 px-2 py-1 text-sm text-right focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <span className="text-slate-500">%</span>
            </div>
            <span className="font-medium">
              Rs. {taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-300 pt-2">
            <span className="text-base font-bold text-slate-900">Grand Total</span>
            <span className="text-base font-bold text-slate-900">
              Rs. {grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Additional notes..."
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Terms & Conditions</label>
          <textarea
            value={termsAndConditions}
            onChange={(e) => setTermsAndConditions(e.target.value)}
            rows={4}
            placeholder="Terms and conditions..."
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-4">
        <Button type="submit" loading={submitting}>
          {isEditing ? "Update Invoice" : "Create Invoice"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
