"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const paymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.number().positive("Amount must be positive"),
  paymentDate: z.string().min(1, "Payment date is required"),
  method: z.string().min(1, "Payment method is required"),
  reference: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export async function getPayments(
  search?: string,
  method?: string,
  page: number = 1,
  pageSize: number = 10
) {
  const conditions: object[] = [];

  if (search) {
    conditions.push({
      OR: [
        { invoice: { invoiceNumber: { contains: search } } },
        { invoice: { customer: { name: { contains: search } } } },
      ],
    });
  }

  if (method) {
    conditions.push({ method });
  }

  const where = conditions.length > 0 ? { AND: conditions } : {};

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { paymentDate: "desc" },
      include: {
        invoice: {
          include: {
            customer: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return { payments, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getPaymentById(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      invoice: {
        include: {
          customer: true,
          payments: { select: { amount: true } },
        },
      },
    },
  });

  return payment;
}

export async function createPayment(data: PaymentFormData) {
  const parsed = paymentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const { invoiceId, amount, paymentDate, method, reference, notes } = parsed.data;

  // Validate amount doesn't exceed remaining balance
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: { select: { amount: true } } },
  });

  if (!invoice) {
    return { success: false as const, errors: { invoiceId: ["Invoice not found"] } };
  }

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = round2(invoice.grandTotal - totalPaid);

  if (amount > remainingBalance + 0.01) {
    return { success: false as const, errors: { amount: ["Amount exceeds remaining balance"] } };
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      paymentDate: new Date(paymentDate),
      method,
      reference: reference || null,
      notes: notes || null,
    },
  });

  // Update invoice status
  const newTotalPaid = round2(totalPaid + amount);
  let newStatus = invoice.status;
  if (newTotalPaid >= invoice.grandTotal) {
    newStatus = "PAID";
  } else if (newTotalPaid > 0) {
    newStatus = "PARTIALLY_PAID";
  }

  if (newStatus !== invoice.status) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
    });
  }

  revalidatePath("/payments");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  return { success: true as const, payment };
}

export async function deletePayment(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      invoice: {
        include: { payments: { select: { id: true, amount: true } } },
      },
    },
  });

  if (!payment) {
    return { success: false as const, error: "Payment not found" };
  }

  await prisma.payment.delete({ where: { id } });

  // Recalculate invoice status
  const remainingPayments = payment.invoice.payments.filter((p) => p.id !== id);
  const newTotalPaid = round2(remainingPayments.reduce((sum, p) => sum + p.amount, 0));

  let newStatus: string;
  if (newTotalPaid >= payment.invoice.grandTotal) {
    newStatus = "PAID";
  } else if (newTotalPaid > 0) {
    newStatus = "PARTIALLY_PAID";
  } else {
    newStatus = "DRAFT";
  }

  await prisma.invoice.update({
    where: { id: payment.invoiceId },
    data: { status: newStatus },
  });

  revalidatePath("/payments");
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${payment.invoiceId}`);
  return { success: true as const };
}

export async function getOutstandingInvoices() {
  const invoices = await prisma.invoice.findMany({
    where: {
      status: { in: ["DRAFT", "SENT", "PARTIALLY_PAID", "OVERDUE"] },
    },
    include: {
      customer: { select: { name: true } },
      payments: { select: { amount: true } },
    },
    orderBy: { invoiceDate: "desc" },
  });

  return invoices.map((inv) => {
    const totalPaid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer.name,
      grandTotal: inv.grandTotal,
      totalPaid: round2(totalPaid),
      balance: round2(inv.grandTotal - totalPaid),
    };
  });
}
