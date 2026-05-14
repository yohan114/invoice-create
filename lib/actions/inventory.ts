"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const partSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().default(""),
  quantity: z.coerce.number().int().min(0, "Quantity must be 0 or more"),
  unitPrice: z.coerce.number().min(0, "Unit price must be 0 or more"),
  costPrice: z.coerce.number().min(0, "Cost price must be 0 or more"),
  supplier: z.string().optional().default(""),
  reorderLevel: z.coerce.number().int().min(0).default(5),
  unit: z.string().default("pcs"),
});

export type PartFormData = z.infer<typeof partSchema>;

export async function getParts(
  search?: string,
  page: number = 1,
  pageSize: number = 10,
  lowStockOnly: boolean = false
) {
  const conditions: object[] = [];

  if (search) {
    conditions.push({
      OR: [
        { name: { contains: search } },
        { supplier: { contains: search } },
      ],
    });
  }

  if (lowStockOnly) {
    const lowStockParts = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM Part WHERE quantity <= reorderLevel`
    );
    const lowStockIds = lowStockParts.map((p) => p.id);
    conditions.push({
      id: { in: lowStockIds.length > 0 ? lowStockIds : ["__none__"] },
    });
  }

  const where = conditions.length > 0 ? { AND: conditions } : {};

  const [parts, total] = await Promise.all([
    prisma.part.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.part.count({ where }),
  ]);

  return { parts, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getPartById(id: string) {
  return prisma.part.findUnique({ where: { id } });
}

export async function createPart(data: PartFormData) {
  const parsed = partSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const part = await prisma.part.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      quantity: parsed.data.quantity,
      unitPrice: parsed.data.unitPrice,
      costPrice: parsed.data.costPrice,
      supplier: parsed.data.supplier || null,
      reorderLevel: parsed.data.reorderLevel,
      unit: parsed.data.unit,
    },
  });

  revalidatePath("/inventory");
  return { success: true, part };
}

export async function updatePart(id: string, data: PartFormData) {
  const parsed = partSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const part = await prisma.part.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      quantity: parsed.data.quantity,
      unitPrice: parsed.data.unitPrice,
      costPrice: parsed.data.costPrice,
      supplier: parsed.data.supplier || null,
      reorderLevel: parsed.data.reorderLevel,
      unit: parsed.data.unit,
    },
  });

  revalidatePath("/inventory");
  return { success: true, part };
}

export async function deletePart(id: string) {
  await prisma.part.delete({ where: { id } });
  revalidatePath("/inventory");
  return { success: true };
}
