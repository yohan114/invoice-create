"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

function getJwtSecret(): string {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return "workshop-dev-secret-do-not-use-in-production";
}

const TOKEN_NAME = "token";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    if (!user.active) {
      return { success: false, error: "Account is inactive" };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return { success: false, error: "Invalid email or password" };
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    const cookieStore = await cookies();
    cookieStore.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, getJwtSecret()) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}
