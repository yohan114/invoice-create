"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

const jobSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  itemDescription: z.string().min(1, "Item/equipment description is required"),
  problemDescription: z.string().min(1, "Problem description is required"),
  technicianId: z.string().optional().default(""),
  equipmentId: z.string().optional().default(""),
  date: z.string().optional(),
  notes: z.string().optional().default(""),
});

export type JobFormData = z.infer<typeof jobSchema>;

const VALID_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "DELIVERED", "CANCELLED"] as const;

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function getJobs(
  search?: string,
  status?: string,
  page: number = 1,
  pageSize: number = 10
) {
  const conditions: object[] = [];

  if (search) {
    conditions.push({
      OR: [
        { jobNumber: { contains: search } },
        { itemDescription: { contains: search } },
        { customer: { name: { contains: search } } },
      ],
    });
  }

  if (status && VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    conditions.push({ status });
  }

  const where = conditions.length > 0 ? { AND: conditions } : {};

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { date: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return { jobs, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getJobStatusCounts() {
  const [all, pending, inProgress, completed, delivered, cancelled] = await Promise.all([
    prisma.job.count(),
    prisma.job.count({ where: { status: "PENDING" } }),
    prisma.job.count({ where: { status: "IN_PROGRESS" } }),
    prisma.job.count({ where: { status: "COMPLETED" } }),
    prisma.job.count({ where: { status: "DELIVERED" } }),
    prisma.job.count({ where: { status: "CANCELLED" } }),
  ]);

  return { all, pending, inProgress, completed, delivered, cancelled };
}

export async function getJobById(id: string) {
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, phone: true, email: true } },
      technician: { select: { id: true, name: true } },
      invoices: {
        orderBy: { invoiceDate: "desc" },
        select: {
          id: true,
          invoiceNumber: true,
          invoiceDate: true,
          grandTotal: true,
          status: true,
        },
      },
    },
  });

  return job;
}

async function generateJobNumber(tx: Prisma.TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `JOB-${year}-`;

  const lastJob = await tx.job.findFirst({
    where: {
      jobNumber: { startsWith: prefix },
    },
    orderBy: { jobNumber: "desc" },
  });

  let nextNumber = 1;
  if (lastJob) {
    const lastNumberStr = lastJob.jobNumber.replace(prefix, "");
    const lastNumber = parseInt(lastNumberStr, 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
}

export async function createJob(data: JobFormData) {
  const parsed = jobSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const jobDate = parsed.data.date ? new Date(parsed.data.date) : new Date();

  const createJobInTransaction = async (retry = false) => {
    try {
      return await prisma.$transaction(async (tx) => {
        const jobNumber = await generateJobNumber(tx);

        const job = await tx.job.create({
          data: {
            jobNumber,
            date: jobDate,
            customerId: parsed.data.customerId,
            itemDescription: parsed.data.itemDescription,
            problemDescription: parsed.data.problemDescription,
            technicianId: parsed.data.technicianId || null,
            equipmentId: parsed.data.equipmentId || null,
            status: "PENDING",
            notes: parsed.data.notes || null,
          },
        });

        return job;
      });
    } catch (error) {
      if (
        !retry &&
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return createJobInTransaction(true);
      }
      throw error;
    }
  };

  const job = await createJobInTransaction();

  revalidatePath("/jobs");
  return { success: true, job };
}

export async function updateJob(id: string, data: JobFormData) {
  const parsed = jobSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const jobDate = parsed.data.date ? new Date(parsed.data.date) : undefined;

  const job = await prisma.job.update({
    where: { id },
    data: {
      customerId: parsed.data.customerId,
      itemDescription: parsed.data.itemDescription,
      problemDescription: parsed.data.problemDescription,
      technicianId: parsed.data.technicianId || null,
      equipmentId: parsed.data.equipmentId || null,
      notes: parsed.data.notes || null,
      ...(jobDate && { date: jobDate }),
    },
  });

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  return { success: true, job };
}

export async function updateJobStatus(id: string, newStatus: string) {
  if (!VALID_STATUSES.includes(newStatus as (typeof VALID_STATUSES)[number])) {
    return { success: false, error: "Invalid status" };
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    return { success: false, error: "Job not found" };
  }

  const allowedTransitions = STATUS_TRANSITIONS[job.status];
  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    return {
      success: false,
      error: `Cannot change status from ${job.status} to ${newStatus}`,
    };
  }

  const updateData: { status: string; completionDate?: Date } = { status: newStatus };
  if (newStatus === "COMPLETED") {
    updateData.completionDate = new Date();
  }

  const updatedJob = await prisma.job.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/jobs");
  revalidatePath(`/jobs/${id}`);
  return { success: true, job: updatedJob };
}

export async function deleteJob(id: string) {
  await prisma.job.delete({ where: { id } });
  revalidatePath("/jobs");
  return { success: true };
}

export async function getCustomersForSelect() {
  const customers = await prisma.customer.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return customers;
}

export async function getTechniciansForSelect() {
  const technicians = await prisma.user.findMany({
    where: {
      active: true,
      OR: [{ role: "TECHNICIAN" }, { role: "ADMIN" }],
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return technicians;
}
