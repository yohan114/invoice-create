"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-utils";

const equipmentSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  name: z.string().min(1, "Name is required"),
  modelNumber: z.string().optional().default(""),
  serialNumber: z.string().optional().default(""),
  registrationNumber: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

export type EquipmentFormData = z.infer<typeof equipmentSchema>;

export async function getEquipment(
  search?: string,
  page: number = 1,
  pageSize: number = 10
) {
  const conditions: object[] = [];

  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search } },
        { modelNumber: { contains: search } },
        { serialNumber: { contains: search } },
        { registrationNumber: { contains: search } },
        { customer: { name: { contains: search } } },
      ],
    });
  }

  const where = conditions.length > 0 ? { AND: conditions } : {};

  const [equipment, total] = await Promise.all([
    prisma.equipment.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true } },
      },
    }),
    prisma.equipment.count({ where }),
  ]);

  return { equipment, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getEquipmentById(id: string) {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true } },
      jobs: {
        orderBy: { date: "desc" },
        select: {
          id: true,
          jobNumber: true,
          itemDescription: true,
          status: true,
          date: true,
        },
      },
    },
  });

  return equipment;
}

export async function createEquipment(data: EquipmentFormData) {
  await requireRole(["ADMIN", "MANAGER"]);

  const parsed = equipmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const { customerId, name, modelNumber, serialNumber, registrationNumber, description } = parsed.data;

  const equipment = await prisma.equipment.create({
    data: {
      customerId,
      name,
      modelNumber: modelNumber || null,
      serialNumber: serialNumber || null,
      registrationNumber: registrationNumber || null,
      description: description || null,
    },
  });

  revalidatePath("/equipment");
  return { success: true as const, equipment };
}

export async function updateEquipment(id: string, data: EquipmentFormData) {
  await requireRole(["ADMIN", "MANAGER"]);

  const parsed = equipmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const { customerId, name, modelNumber, serialNumber, registrationNumber, description } = parsed.data;

  const equipment = await prisma.equipment.update({
    where: { id },
    data: {
      customerId,
      name,
      modelNumber: modelNumber || null,
      serialNumber: serialNumber || null,
      registrationNumber: registrationNumber || null,
      description: description || null,
    },
  });

  revalidatePath("/equipment");
  revalidatePath(`/equipment/${id}`);
  return { success: true as const, equipment };
}

export async function deleteEquipment(id: string) {
  await requireRole(["ADMIN", "MANAGER"]);

  // Check if equipment has linked jobs
  const jobCount = await prisma.job.count({ where: { equipmentId: id } });
  if (jobCount > 0) {
    return {
      success: false as const,
      error: "Cannot delete equipment with linked jobs. Unlink jobs first.",
    };
  }

  await prisma.equipment.delete({ where: { id } });
  revalidatePath("/equipment");
  return { success: true as const };
}

export async function getEquipmentForCustomer(customerId: string) {
  const equipment = await prisma.equipment.findMany({
    where: { customerId },
    select: { id: true, name: true, modelNumber: true, serialNumber: true },
    orderBy: { name: "asc" },
  });
  return equipment;
}

export async function getCustomersForSelect() {
  const customers = await prisma.customer.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return customers;
}
