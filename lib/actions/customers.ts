"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().default(""),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional().default(""),
  taxNumber: z.string().optional().default(""),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export async function getCustomers(
  search?: string,
  page: number = 1,
  pageSize: number = 10
) {
  const where = search
    ? {
        OR: [
          { name: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search } },
        ],
      }
    : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count({ where }),
  ]);

  return { customers, total, totalPages: Math.ceil(total / pageSize) };
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      jobs: {
        orderBy: { date: "desc" },
        take: 10,
      },
      invoices: {
        orderBy: { invoiceDate: "desc" },
        take: 10,
      },
    },
  });

  return customer;
}

export async function createCustomer(data: CustomerFormData) {
  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const customer = await prisma.customer.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      taxNumber: parsed.data.taxNumber || null,
    },
  });

  revalidatePath("/customers");
  return { success: true, customer };
}

export async function updateCustomer(id: string, data: CustomerFormData) {
  const parsed = customerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address: parsed.data.address || null,
      taxNumber: parsed.data.taxNumber || null,
    },
  });

  revalidatePath("/customers");
  return { success: true, customer };
}

export async function deleteCustomer(id: string) {
  await prisma.customer.delete({ where: { id } });
  revalidatePath("/customers");
  return { success: true };
}
