"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-utils";

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Role is required"),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(1, "Role is required"),
  active: z.boolean(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export async function getUsers() {
  await requireRole(["ADMIN"]);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
  return users;
}

export async function createUser(data: CreateUserFormData) {
  await requireRole(["ADMIN"]);

  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password, role } = parsed.data;

  // Check uniqueness
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false as const, errors: { email: ["Email already in use"] } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });

  revalidatePath("/settings/users");
  return { success: true as const, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

export async function updateUser(id: string, data: UpdateUserFormData) {
  await requireRole(["ADMIN"]);

  const parsed = updateUserSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, role, active } = parsed.data;

  // Check email uniqueness (exclude current user)
  const existing = await prisma.user.findFirst({
    where: { email, id: { not: id } },
  });
  if (existing) {
    return { success: false as const, errors: { email: ["Email already in use"] } };
  }

  await prisma.user.update({
    where: { id },
    data: { name, email, role, active },
  });

  revalidatePath("/settings/users");
  return { success: true as const };
}

export async function changePassword(id: string, newPassword: string) {
  await requireRole(["ADMIN"]);

  if (newPassword.length < 6) {
    return { success: false as const, error: "Password must be at least 6 characters" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  revalidatePath("/settings/users");
  return { success: true as const };
}

export async function deleteUser(id: string) {
  await requireRole(["ADMIN"]);

  // Soft delete (set active=false)
  await prisma.user.update({
    where: { id },
    data: { active: false },
  });

  revalidatePath("/settings/users");
  return { success: true as const };
}
