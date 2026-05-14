"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-utils";
import { Prisma } from "@prisma/client";

const invoiceItemSchema = z.object({
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  partId: z.string().optional().default(""),
});

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  jobId: z.string().optional().default(""),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().optional().default(""),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  discountPercent: z.number().min(0).max(100).default(0),
  taxPercent: z.number().min(0).max(100).default(0),
  ssclPercent: z.number().min(0).max(100).default(0),
  invoiceType: z.string().optional().default("PROFORMA"),
  poNumber: z.string().optional().default(""),
  poDate: z.string().optional().default(""),
  deliveryDate: z.string().optional().default(""),
  grnNumber: z.string().optional().default(""),
  paymentTerms: z.string().optional().default(""),
  referenceNumber: z.string().optional().default(""),
  deliveryAddress: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  termsAndConditions: z.string().optional().default(""),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

async function generateInvoiceNumber(tx: Prisma.TransactionClient): Promise<string> {
  const settings = await tx.companySettings.findFirst();
  const prefix = settings?.invoicePrefix || "INV";
  const year = new Date().getFullYear();
  const fullPrefix = `${prefix}-${year}-`;

  const lastInvoice = await tx.invoice.findFirst({
    where: {
      invoiceNumber: { startsWith: fullPrefix },
    },
    orderBy: { invoiceNumber: "desc" },
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumberStr = lastInvoice.invoiceNumber.replace(fullPrefix, "");
    const lastNumber = parseInt(lastNumberStr, 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${fullPrefix}${nextNumber.toString().padStart(4, "0")}`;
}

export async function getInvoices(
  search?: string,
  status?: string,
  page: number = 1,
  pageSize: number = 10
) {
  const conditions: object[] = [];

  if (search) {
    conditions.push({
      OR: [
        { invoiceNumber: { contains: search } },
        { customer: { name: { contains: search } } },
      ],
    });
  }

  if (status) {
    conditions.push({ status });
  }

  const where = conditions.length > 0 ? { AND: conditions } : {};

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { invoiceDate: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
        payments: { select: { amount: true } },
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  const invoicesWithPaid = invoices.map((inv) => ({
    ...inv,
    paidAmount: round2(inv.payments.reduce((sum, p) => sum + p.amount, 0)),
  }));

  return { invoices: invoicesWithPaid, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getInvoiceStatusCounts() {
  const [all, draft, sent, paid, partiallyPaid, overdue, cancelled] = await Promise.all([
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "DRAFT" } }),
    prisma.invoice.count({ where: { status: "SENT" } }),
    prisma.invoice.count({ where: { status: "PAID" } }),
    prisma.invoice.count({ where: { status: "PARTIALLY_PAID" } }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    prisma.invoice.count({ where: { status: "CANCELLED" } }),
  ]);

  return { all, draft, sent, paid, partiallyPaid, overdue, cancelled };
}

export async function getInvoiceById(id: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      job: { select: { id: true, jobNumber: true, itemDescription: true } },
      items: {
        include: {
          part: { select: { id: true, name: true, quantity: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  });

  return invoice;
}

export async function createInvoice(data: InvoiceFormData) {
  const parsed = invoiceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const { customerId, jobId, invoiceDate, dueDate, items, discountPercent, taxPercent, ssclPercent, invoiceType, poNumber, poDate, deliveryDate, grnNumber, paymentTerms, referenceNumber, deliveryAddress, notes, termsAndConditions } = parsed.data;

  // Calculate totals
  const itemsWithAmounts = items.map((item) => ({
    ...item,
    amount: round2(item.quantity * item.unitPrice),
  }));

  const subtotal = round2(itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0));
  const discountAmount = round2(subtotal * discountPercent / 100);
  const taxableAmount = round2(subtotal - discountAmount);
  const ssclAmount = round2(taxableAmount * ssclPercent / 100);
  const taxAmount = round2(taxableAmount * taxPercent / 100);
  const grandTotal = round2(taxableAmount + ssclAmount + taxAmount);

  const createInvoiceInTransaction = async (retry = false) => {
    try {
      return await prisma.$transaction(async (tx) => {
        const invoiceNumber = await generateInvoiceNumber(tx);

        // Adjust part stock for PART items
        for (const item of items) {
          if (item.type === "PART" && item.partId) {
            await tx.part.update({
              where: { id: item.partId },
              data: { quantity: { decrement: Math.round(item.quantity) } },
            });
          }
        }

        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            invoiceDate: new Date(invoiceDate),
            dueDate: dueDate ? new Date(dueDate) : null,
            customerId,
            jobId: jobId || null,
            invoiceType: invoiceType || "PROFORMA",
            subtotal,
            discountPercent,
            discountAmount,
            taxPercent,
            taxAmount,
            ssclPercent,
            ssclAmount,
            grandTotal,
            status: "DRAFT",
            poNumber: poNumber || null,
            poDate: poDate ? new Date(poDate) : null,
            deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
            grnNumber: grnNumber || null,
            paymentTerms: paymentTerms || null,
            referenceNumber: referenceNumber || null,
            deliveryAddress: deliveryAddress || null,
            notes: notes || null,
            termsAndConditions: termsAndConditions || null,
            items: {
              create: itemsWithAmounts.map((item) => ({
                type: item.type,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount,
                partId: item.partId || null,
              })),
            },
          },
        });

        return invoice;
      });
    } catch (error) {
      // Retry once on unique constraint violation (race condition on number generation)
      if (
        !retry &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return createInvoiceInTransaction(true);
      }
      throw error;
    }
  };

  const invoice = await createInvoiceInTransaction();

  revalidatePath("/invoices");
  return { success: true as const, invoice };
}

export async function updateInvoice(id: string, data: InvoiceFormData) {
  const parsed = invoiceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const { customerId, jobId, invoiceDate, dueDate, items, discountPercent, taxPercent, ssclPercent, invoiceType, poNumber, poDate, deliveryDate, grnNumber, paymentTerms, referenceNumber, deliveryAddress, notes, termsAndConditions } = parsed.data;

  // Calculate totals
  const itemsWithAmounts = items.map((item) => ({
    ...item,
    amount: round2(item.quantity * item.unitPrice),
  }));

  const subtotal = round2(itemsWithAmounts.reduce((sum, item) => sum + item.amount, 0));
  const discountAmount = round2(subtotal * discountPercent / 100);
  const taxableAmount = round2(subtotal - discountAmount);
  const ssclAmount = round2(taxableAmount * ssclPercent / 100);
  const taxAmount = round2(taxableAmount * taxPercent / 100);
  const grandTotal = round2(taxableAmount + ssclAmount + taxAmount);

  const invoice = await prisma.$transaction(async (tx) => {
    // Get existing items to restore stock
    const existingItems = await tx.invoiceItem.findMany({
      where: { invoiceId: id },
    });

    // Restore stock for existing PART items
    for (const item of existingItems) {
      if (item.type === "PART" && item.partId) {
        await tx.part.update({
          where: { id: item.partId },
          data: { quantity: { increment: Math.round(item.quantity) } },
        });
      }
    }

    // Delete old items
    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });

    // Reduce stock for new PART items
    for (const item of items) {
      if (item.type === "PART" && item.partId) {
        await tx.part.update({
          where: { id: item.partId },
          data: { quantity: { decrement: Math.round(item.quantity) } },
        });
      }
    }

    const updatedInvoice = await tx.invoice.update({
      where: { id },
      data: {
        invoiceDate: new Date(invoiceDate),
        dueDate: dueDate ? new Date(dueDate) : null,
        customerId,
        jobId: jobId || null,
        invoiceType: invoiceType || "PROFORMA",
        subtotal,
        discountPercent,
        discountAmount,
        taxPercent,
        taxAmount,
        ssclPercent,
        ssclAmount,
        grandTotal,
        poNumber: poNumber || null,
        poDate: poDate ? new Date(poDate) : null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        grnNumber: grnNumber || null,
        paymentTerms: paymentTerms || null,
        referenceNumber: referenceNumber || null,
        deliveryAddress: deliveryAddress || null,
        notes: notes || null,
        termsAndConditions: termsAndConditions || null,
        items: {
          create: itemsWithAmounts.map((item) => ({
            type: item.type,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            partId: item.partId || null,
          })),
        },
      },
    });

    return updatedInvoice;
  });

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  return { success: true as const, invoice };
}

export async function deleteInvoice(id: string) {
  await requireRole(["ADMIN", "MANAGER"]);

  // Check if invoice has payments
  const paymentCount = await prisma.payment.count({ where: { invoiceId: id } });
  if (paymentCount > 0) {
    return {
      success: false as const,
      error: "Cannot delete invoice with existing payments. Delete payments first.",
    };
  }

  // Restore stock for PART items before deleting
  const existingItems = await prisma.invoiceItem.findMany({
    where: { invoiceId: id },
  });

  for (const item of existingItems) {
    if (item.type === "PART" && item.partId) {
      await prisma.part.update({
        where: { id: item.partId },
        data: { quantity: { increment: Math.round(item.quantity) } },
      });
    }
  }

  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  return { success: true as const };
}

export async function getCustomersForSelect() {
  const customers = await prisma.customer.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return customers;
}

export async function getJobsForCustomer(customerId: string) {
  const jobs = await prisma.job.findMany({
    where: { customerId },
    select: { id: true, jobNumber: true, itemDescription: true },
    orderBy: { date: "desc" },
  });
  return jobs;
}

export async function getPartsForSelect() {
  const parts = await prisma.part.findMany({
    select: { id: true, name: true, unitPrice: true, quantity: true },
    orderBy: { name: "asc" },
  });
  return parts;
}

export async function getCompanySettings() {
  const settings = await prisma.companySettings.findFirst();
  return settings;
}

async function generateTaxInvoiceNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const fullPrefix = `TAX-${year}-`;

  const lastInvoice = await tx.invoice.findFirst({
    where: {
      invoiceNumber: { startsWith: fullPrefix },
    },
    orderBy: { invoiceNumber: "desc" },
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumberStr = lastInvoice.invoiceNumber.replace(fullPrefix, "");
    const lastNumber = parseInt(lastNumberStr, 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${fullPrefix}${nextNumber.toString().padStart(4, "0")}`;
}

export async function convertToTaxInvoice(id: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return { success: false as const, error: "Invoice not found" };
  }

  if (invoice.invoiceType !== "PROFORMA") {
    return { success: false as const, error: "Only proforma invoices can be converted" };
  }

  const convertInTransaction = async (retry = false) => {
    try {
      return await prisma.$transaction(async (tx) => {
        const taxInvoiceNumber = await generateTaxInvoiceNumber(tx);

        const updatedInvoice = await tx.invoice.update({
          where: { id },
          data: {
            invoiceType: "TAX_INVOICE",
            invoiceNumber: taxInvoiceNumber,
          },
        });

        return updatedInvoice;
      });
    } catch (error) {
      if (
        !retry &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return convertInTransaction(true);
      }
      throw error;
    }
  };

  const updatedInvoice = await convertInTransaction();

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  return { success: true as const, invoice: updatedInvoice };
}
